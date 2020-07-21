import * as effector from 'effector';
import * as inspector from '../src';

const event = effector.createEvent();

const $foo = effector.createStore('hello');
const $bar = $foo.map((foo) => foo.length);

const $deep = effector.createStore({
  demo: { baz: 1, baf: 'hello', naf: false },
});

const $number = effector.createStore(0);
const $bool = effector.createStore(false);
const $bool2 = effector.createStore(true);
const $null = effector.createStore(null);
const $date = effector.createStore(new Date());
const $symbol = effector.createStore(Symbol.asyncIterator);

const domain = effector.createDomain();

const $example = domain.createStore(100);

const $set = effector.createStore(
  new Set(['a', 2, false, null, undefined, new Date()]),
);

const $setWrapped = effector.createStore({
  ref: new Set(['a', 2, false, null, undefined, new Date()]),
});

const $map = effector.createStore(
  new Map<string, any>([
    ['a', 2],
    ['b', false],
  ]),
);

const $mapWrapped = effector.createStore({
  ref: new Map<string, any>([
    ['a', 2],
    ['b', false],
  ]),
});

const $setInMap = effector.createStore(
  new Map([['hello', new Set<any>(['a', 2, false, null, undefined])]]),
);

const $mapInSet = effector.createStore(
  new Set([
    new Map([['hello', new Set<any>(['b', 12])]]),
  ]),
);

inspector.addStore($set);
inspector.addStore($setWrapped);
inspector.addStore($map);
inspector.addStore($mapWrapped);
inspector.addStore($setInMap);
inspector.addStore($mapInSet);
inspector.addStore($example);
inspector.addStore($foo);
inspector.addStore($bar, { mapped: true });
inspector.addStore($deep);
inspector.addStore($number);
inspector.addStore($bool);
inspector.addStore($bool2);
inspector.addStore($null);
inspector.addStore($date);
inspector.addStore($symbol);

inspector.createInspector({ visible: true });

setInterval(event, 1800);

$number.on(event, (counter) => counter + 1);
$example.on(event, (counter) => counter + 110);
$date.on(event, () => new Date());
