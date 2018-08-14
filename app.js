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
 * Difference between flatMap and Merge
 */
console.log('\n');
let ab = Observable.create((observer) => {
    observer.onNext(a);
    observer.onNext(b);
    observer.onCompleted();
});

ab.flatMap(data => data)
    .takeUntil(Observable.timer(500))
    .subscribe(getObserver(onNext, onError, onCompleted));









