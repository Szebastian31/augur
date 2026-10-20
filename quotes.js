(() => {
// Daily quotes. Everything here is old enough to be in the public domain, and only quotes with
// a known source are included (no internet misattributions). Everyone sees the same quote on the same day.
const QUOTES = [
  ["The stars incline us, they do not bind us.", "Latin proverb"],
  ["Ad astra per aspera: to the stars, through difficulties.", "Latin motto"],
  ["Fortune favours the bold.", "Virgil, Aeneid"],
  ["Seize the day, trusting as little as possible in tomorrow.", "Horace, Odes"],
  ["Know thyself.", "Inscription at the Temple of Apollo, Delphi"],
  ["Nothing in excess.", "Inscription at the Temple of Apollo, Delphi"],
  ["Character is destiny.", "Heraclitus"],
  ["No man ever steps in the same river twice, for it's not the same river and he's not the same man.", "Heraclitus"],
  ["The unexamined life is not worth living.", "Socrates, in Plato's Apology"],
  ["The beginning is the most important part of the work.", "Plato, The Republic"],
  ["Well begun is half done.", "Aristotle, Politics"],
  ["Hope is a waking dream.", "Aristotle"],
  ["The journey of a thousand miles begins with a single step.", "Lao Tzu, Tao Te Ching"],
  ["Knowing others is intelligence; knowing yourself is true wisdom.", "Lao Tzu, Tao Te Ching"],
  ["Real knowledge is to know the extent of one's ignorance.", "Confucius, Analects"],
  ["To go beyond is as wrong as to fall short.", "Confucius, Analects"],
  ["Very little is needed to make a happy life; it is all within yourself, in your way of thinking.", "Marcus Aurelius, Meditations"],
  ["Waste no more time arguing about what a good man should be. Be one.", "Marcus Aurelius, Meditations"],
  ["The soul becomes dyed with the colour of its thoughts.", "Marcus Aurelius, Meditations"],
  ["Dwell on the beauty of life. Watch the stars, and see yourself running with them.", "Marcus Aurelius, Meditations"],
  ["Look within. Within is the fountain of good, and it will ever bubble up, if you will ever dig.", "Marcus Aurelius, Meditations"],
  ["While we are postponing, life speeds by.", "Seneca, Letters"],
  ["It is not that we have a short time to live, but that we waste a lot of it.", "Seneca, On the Shortness of Life"],
  ["Difficulties strengthen the mind, as labour does the body.", "Seneca"],
  ["Begin at once to live, and count each separate day as a separate life.", "Seneca, Letters"],
  ["As is a tale, so is life: not how long it is, but how good it is, is what matters.", "Seneca, Letters"],
  ["No man is free who is not master of himself.", "Epictetus"],
  ["First say to yourself what you would be; and then do what you have to do.", "Epictetus, Discourses"],
  ["The fault, dear Brutus, is not in our stars, but in ourselves.", "William Shakespeare, Julius Caesar"],
  ["There is a tide in the affairs of men, which, taken at the flood, leads on to fortune.", "William Shakespeare, Julius Caesar"],
  ["We know what we are, but know not what we may be.", "William Shakespeare, Hamlet"],
  ["Our doubts are traitors, and make us lose the good we oft might win, by fearing to attempt.", "William Shakespeare, Measure for Measure"],
  ["Be not afraid of greatness.", "William Shakespeare, Twelfth Night"],
  ["Though she be but little, she is fierce.", "William Shakespeare, A Midsummer Night's Dream"],
  ["The heart has its reasons which reason knows nothing of.", "Blaise Pascal, Pensées"],
  ["Patience and time do more than strength or passion.", "Jean de La Fontaine, Fables"],
  ["Have patience with all things, but first of all with yourself.", "Francis de Sales"],
  ["Adopt the pace of nature: her secret is patience.", "Ralph Waldo Emerson"],
  ["Write it on your heart that every day is the best day in the year.", "Ralph Waldo Emerson"],
  ["Nothing great was ever achieved without enthusiasm.", "Ralph Waldo Emerson, Circles"],
  ["If one advances confidently in the direction of his dreams, he will meet with a success unexpected in common hours.", "Henry David Thoreau, Walden"],
  ["Our life is frittered away by detail. Simplify, simplify.", "Henry David Thoreau, Walden"],
  ["I exist as I am, that is enough.", "Walt Whitman, Song of Myself"],
  ["Do I contradict myself? Very well then I contradict myself. I am large, I contain multitudes.", "Walt Whitman, Song of Myself"],
  ["Hope is the thing with feathers that perches in the soul.", "Emily Dickinson"],
  ["Forever is composed of nows.", "Emily Dickinson"],
  ["I'm not afraid of storms, for I'm learning how to sail my ship.", "Louisa May Alcott, Little Women"],
  ["The sun himself is weak when he first rises, and gathers strength and courage as the day gets on.", "Charles Dickens, The Old Curiosity Shop"],
  ["We are all in the gutter, but some of us are looking at the stars.", "Oscar Wilde, Lady Windermere's Fan"],
  ["To love oneself is the beginning of a lifelong romance.", "Oscar Wilde, An Ideal Husband"],
  ["I have loved the stars too fondly to be fearful of the night.", "Sarah Williams, The Old Astronomer"],
  ["For my part I know nothing with any certainty, but the sight of the stars makes me dream.", "Vincent van Gogh, letter to his brother Theo"],
  ["Nothing in life is to be feared, it is only to be understood.", "Marie Curie"],
  ["We must have perseverance and above all confidence in ourselves.", "Marie Curie"],
  ["The best way out is always through.", "Robert Frost, A Servant to Servants"],
  ["Two roads diverged in a wood, and I, I took the one less travelled by, and that has made all the difference.", "Robert Frost, The Road Not Taken"],
  ["Rest is not idleness, and to lie sometimes on the grass on a summer's day, watching the clouds float across the sky, is by no means a waste of time.", "John Lubbock, The Use of Life"],
  ["Do what you can, with what you have, where you are.", "Theodore Roosevelt, quoting Squire Bill Widener"],
  ["Fall seven times, stand up eight.", "Japanese proverb"],
  ["Little by little, one goes far.", "Spanish proverb"],
];

// a fixed shuffle (same for everyone), then one quote per day
function quoteFor(date){
  const dayNumber = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())/86400000);
  const n = QUOTES.length;
  const i = ((dayNumber*37) % n + n) % n;   // 37 is coprime with the list length, so every quote comes round
  return {text:QUOTES[i][0], by:QUOTES[i][1]};
}

window.Quotes = {QUOTES, quoteFor};
})();
