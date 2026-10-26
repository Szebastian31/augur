package com.augur.stars;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import java.io.File;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import android.window.OnBackInvokedDispatcher;
import androidx.webkit.WebViewAssetLoader;

/**
 * Augur's whole interface is the web app, bundled in the APK. This activity hosts it edge to edge and
 * gives it what a browser can't do as nicely: the system share sheet and the phone's vibration motor.
 * Birth details live in the WebView's local storage, which never leaves the phone
 * (allowBackup is off, so it isn't copied to cloud backups either).
 */
public class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START = "https://" + HOST + "/assets/www/index.html";
    private static final String NIGHT = "#120a2e";

    private WebView web;
    // status and navigation bar heights in CSS pixels, handed to the page as --sat / --sab
    private int insetTop, insetBottom;
    // dark bar icons for the light Paper look
    private boolean lightBars;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        // If Augur crashed last time, show what happened instead of crashing again, so it can be sent on.
        // Your birth details aren't touched: they're in the WebView's storage, not here.
        final File crash = new File(getFilesDir(), "crash.txt");
        final Thread.UncaughtExceptionHandler prev = Thread.getDefaultUncaughtExceptionHandler();
        Thread.setDefaultUncaughtExceptionHandler((th, e) -> {
            try (FileOutputStream o = new FileOutputStream(crash)) {
                java.io.StringWriter sw = new java.io.StringWriter();
                java.io.PrintWriter pw = new java.io.PrintWriter(sw);
                e.printStackTrace(pw);
                pw.flush();
                String head = "Augur " + appVersion() + " · Android " + Build.VERSION.RELEASE + " (API " + Build.VERSION.SDK_INT + ") · " + Build.MANUFACTURER + " " + Build.MODEL + "\n\n";
                o.write((head + sw).getBytes(StandardCharsets.UTF_8));
            } catch (Exception ignored) {}
            if (prev != null) prev.uncaughtException(th, e);
        });
        if (crash.exists()) { showCrash(crash); return; }

        try { edgeToEdge(); } catch (Exception ignored) {}

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor(NIGHT));
        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor(NIGHT));
        root.addView(web, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        setContentView(root);

        // the page draws under the bars and pads itself; only the keyboard shrinks the WebView
        root.setOnApplyWindowInsetsListener((v, ins) -> {
            try {
                int top, bottom, ime;
                if (Build.VERSION.SDK_INT >= 30) {
                    Insets bars = ins.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                    top = bars.top; bottom = bars.bottom;
                    ime = ins.getInsets(WindowInsets.Type.ime()).bottom;
                } else {
                    top = ins.getSystemWindowInsetTop();
                    bottom = ins.getStableInsetBottom();
                    ime = Math.max(0, ins.getSystemWindowInsetBottom() - bottom);
                }
                v.setPadding(0, 0, 0, ime);
                float d = getResources().getDisplayMetrics().density;
                insetTop = Math.round(top / d);
                insetBottom = ime > 0 ? 0 : Math.round(bottom / d);
                pushInsets();
            } catch (Exception ignored) {}
            return ins;
        });

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        s.setTextZoom(100);

        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                return loader.shouldInterceptRequest(req.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (HOST.equals(u.getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) {}
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                pushInsets();
            }
        });

        web.addJavascriptInterface(new Bridge(), "AugurNative");

        // Android 16 no longer calls onBackPressed for apps targeting it; back arrives here instead
        if (Build.VERSION.SDK_INT >= 33) try {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::goBack);
        } catch (Exception ignored) {}

        if (state != null) web.restoreState(state);
        else web.loadUrl(START);
    }

    /** What went wrong last time, with Share (to send it on) and Try again. Plain Android views only, nothing that could fail the same way. */
    private void showCrash(File crash) {
        String text;
        try { text = new String(java.nio.file.Files.readAllBytes(crash.toPath()), StandardCharsets.UTF_8); }
        catch (Exception e) { text = "(the error report couldn't be read)"; }
        final String report = text;
        float d = getResources().getDisplayMetrics().density;
        int pad = Math.round(20 * d);

        android.widget.LinearLayout box = new android.widget.LinearLayout(this);
        box.setOrientation(android.widget.LinearLayout.VERTICAL);
        box.setBackgroundColor(Color.parseColor(NIGHT));
        box.setPadding(pad, Math.round(56 * d), pad, Math.round(32 * d));

        android.widget.TextView title = new android.widget.TextView(this);
        title.setText("Augur stopped last time");
        title.setTextColor(Color.WHITE);
        title.setTextSize(22);
        box.addView(title);

        android.widget.TextView lead = new android.widget.TextView(this);
        lead.setText("Your birth details are safe. Tap Share and send this to whoever is fixing the app, then Try again.");
        lead.setTextColor(Color.parseColor("#C9BEE8"));
        lead.setTextSize(15);
        lead.setPadding(0, Math.round(8 * d), 0, Math.round(14 * d));
        box.addView(lead);

        android.widget.LinearLayout row = new android.widget.LinearLayout(this);
        android.widget.Button share = new android.widget.Button(this);
        share.setText("Share");
        share.setOnClickListener(v -> {
            Intent i = new Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, report);
            try { startActivity(Intent.createChooser(i, "Share")); } catch (Exception ignored) {}
        });
        android.widget.Button again = new android.widget.Button(this);
        again.setText("Try again");
        again.setOnClickListener(v -> { crash.delete(); recreate(); });
        row.addView(share);
        row.addView(again);
        box.addView(row);

        android.widget.TextView log = new android.widget.TextView(this);
        log.setText(report);
        log.setTextColor(Color.parseColor("#E6E0F5"));
        log.setTextSize(11);
        log.setTypeface(android.graphics.Typeface.MONOSPACE);
        log.setTextIsSelectable(true);
        log.setPadding(0, Math.round(14 * d), 0, 0);
        android.widget.ScrollView scroll = new android.widget.ScrollView(this);
        scroll.addView(log);
        box.addView(scroll, new android.widget.LinearLayout.LayoutParams(-1, 0, 1f));
        setContentView(box);
    }

    private String appVersion() {
        try { return getPackageManager().getPackageInfo(getPackageName(), 0).versionName; } catch (Exception e) { return "?"; }
    }

    @SuppressWarnings("deprecation")
    private void edgeToEdge() {
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);
        getWindow().setStatusBarContrastEnforced(false);
        getWindow().setNavigationBarContrastEnforced(false);
        getWindow().getAttributes().layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        if (Build.VERSION.SDK_INT >= 30) getWindow().setDecorFitsSystemWindows(false);
        applyBars();
    }

    @SuppressWarnings("deprecation")
    private void applyBars() {
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController c = getWindow().getInsetsController();
            if (c == null) return;
            int both = WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS | WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS;
            c.setSystemBarsAppearance(lightBars ? both : 0, both);
        } else {
            int f = View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION;
            if (lightBars) f |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            getWindow().getDecorView().setSystemUiVisibility(f);
        }
    }

    private void pushInsets() {
        if (web == null) return;
        web.evaluateJavascript("(function(s){s.setProperty('--sat','" + insetTop + "px');s.setProperty('--sab','" + insetBottom + "px')})(document.documentElement.style)", null);
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        if (web != null) web.saveState(out);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web == null) return;
        web.onResume();
        // a new day may have started while Augur was in the background
        web.evaluateJavascript("window.augurResume&&augurResume()", null);
    }

    @Override
    protected void onPause() {
        if (web != null) web.onPause();
        super.onPause();
    }

    /** Back (Android 15 and older) */
    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        goBack();
    }

    /** Lets the page close a sheet or return to Today first; otherwise Augur goes to the background. */
    private void goBack() {
        if (web == null) { finish(); return; }
        web.evaluateJavascript("window.augurBack?augurBack():false", v -> {
            if (!"true".equals(v)) moveTaskToBack(true);
        });
    }

    @Override
    protected void onDestroy() {
        if (web != null) web.destroy();
        super.onDestroy();
    }

    /** Everything the web app can ask Android for, as window.AugurNative. */
    private class Bridge {
        /** Opens the system share sheet with plain text, e.g. today's reading. */
        @JavascriptInterface
        public void share(String text) {
            runOnUiThread(() -> {
                Intent i = new Intent(Intent.ACTION_SEND);
                i.setType("text/plain");
                i.putExtra(Intent.EXTRA_TEXT, text);
                try { startActivity(Intent.createChooser(i, "Share")); } catch (Exception ignored) {}
            });
        }

        /** Same patterns as navigator.vibrate: "18" or "18,40,18" (vibrate, pause, vibrate…). */
        @JavascriptInterface
        public void vibrate(String csv) {
            Vibrator vib = getSystemService(Vibrator.class);
            if (vib == null || !vib.hasVibrator()) return;
            try {
                String[] parts = csv.split(",");
                if (parts.length == 1) {
                    vib.vibrate(VibrationEffect.createOneShot(Math.max(1, Long.parseLong(parts[0].trim())), VibrationEffect.DEFAULT_AMPLITUDE));
                    return;
                }
                long[] pattern = new long[parts.length + 1];
                for (int k = 0; k < parts.length; k++) pattern[k + 1] = Long.parseLong(parts[k].trim());
                vib.vibrate(VibrationEffect.createWaveform(pattern, -1));
            } catch (Exception ignored) {
            }
        }

        /** Dark status and navigation bar icons (true) for light looks, light icons (false) otherwise. */
        @JavascriptInterface
        public void setBars(boolean light) {
            if (light == lightBars) return;
            runOnUiThread(() -> { lightBars = light; applyBars(); });
        }

        @JavascriptInterface
        public String version() {
            try {
                return getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
            } catch (Exception e) {
                return "";
            }
        }
    }
}
