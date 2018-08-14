var Observable = Rx.Observable;

// Observer generator
function getObserver(onNext, onError, onCompleted) {
    return Rx.Observer.create(
        (x) => { onNext(x) },
        (e) => { onError(e) },
        () => { onCompleted() }
    )
}

// Callbacks of an observer
let onNext = (x) => {
    console.log('Data emitted -> ', x);
};

let onError = (e) => {
    console.log('Error catched -> ', e);
};

let onCompleted = () => {
    console.log('End of stream');
};

/**
 * Observable sources
 */
let source1 = Observable.create((observer) => {
    observer.onNext(1);
    observer.onNext(11);
    observer.onNext(21);
    observer.onNext(1211);
    observer.onCompleted();
});

let source2 = Observable.create((observer) => {
    observer.onNext('a');
    observer.onNext('b');
    observer.onNext('c');
    observer.onNext('d');
    observer.onCompleted();
});

// Special stream composed by source1 and source2 streams for flatMap operator
let source3 = Observable.create((observer) => {
    observer.onNext(source1);
    observer.onNext(source2);
    observer.onCompleted();
});

/**
 * FlatMap
 * ---X---Y---Z---T---
 * -1---2---3---4---5-
 * -1-X-2-Y-3-Z-4-T-5-
 */
console.log('\n');
source3
    .flatMap(data => data)
    .subscribe(getObserver(onNext, onError, onCompleted));

/**
 * CombineLatest 
 * ----X----Y--------------
 * -----------1----2-----3-
 * ----Y1----Y2----Y3------
 */
console.log('\n');
let combined = Observable.combineLatest(source1, source2);
combined.subscribe(getObserver(onNext, onError, onCompleted));

/**
 * Merge + interval + takeUntil
 */
console.log('\n');
let a = Observable.interval(200).map(x => 'A ' + x),
    b = Observable.interval(100).map(y => 'B ' + y);

Rx.Observable
    .merge(a, b)
    .takeUntil(Observable.timer(500))
    .subscribe(getObserver(onNext, onError, onCompleted));

/**
 * Scan agit comme reduce mais émet les valeurs intermédiaires dans le temps
 * Range crée une rangée de nombres entiers
 */
console.log('\n');
let average = Observable
    .range(0, 5)
    .scan((prev, current) => {
        return {
            sum: prev.sum + current,
            count: prev.count + 1
        };
    }, { sum: 0, count: 0 })
    .map(x => x.sum / x.count);

average.subscribe(getObserver(onNext, onError, onCompleted));

/**
 * Observable + http + scan
 */
console.log('\n');
let httpSource = Observable.create((observer) => {
    let req = new XMLHttpRequest();
    req.open('GET', 'https://jsonplaceholder.typicode.com/todos');
    req.onload = () => {
        if (req.status == 200) {
            observer.onNext(JSON.parse(req.response).filter(x => x.userId == 2));
        }
        else {
            observer.onError("Erreur 400");
        }
    };
    req.onError = () => {
        observer.onError("Une erreur inconnue est survenue");
    };
    req.send();
});

httpSource.subscribe(getObserver(onNext, onError, onCompleted));

/**
 * Capture d'erreur sans interruption du flux
 */
let arraySource = Observable.from([
    '{"id":1}', // Cas ok
    '{"id:2}' // Cas d'erreur
]);

console.log('\n');
arraySource
    .map(x => JSON.parse(x))
    .retry(2)
    .catch(Observable.return({
        error: "Error parsing json"
    }))
    .subscribe(getObserver(onNext, onError, onCompleted));

/**
 * Second test de l'opérateur scan
 */

let words = [
    'Hello ',
    'my ',
    'name ',
    'is ',
    'josé.'
];

let wordsSource = Observable.from(words);

console.log('\n');
wordsSource
    .map(x => x.toUpperCase())
    .reduce((previous, current) => { // ou .scan pour avoir les valeurs intermédiaires
        return {
            index: previous.index + 1,
            word: previous.word + current,
            isCompleted: previous.word.split(' ').length == words.length
        }
    }, { word: "", isCompleted: false, index: -1 })
    .catch(
        Observable.return({
            message: "Une erreur est survenue lors de la construction du mot à partir du flux"
        })
    )
    .subscribe(getObserver(onNext, onError, onCompleted));











