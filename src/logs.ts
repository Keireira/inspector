import { Store, createStore, createEvent, combine, Event } from 'effector';
import { list, h } from 'forest';

import { LogMeta, Kind, Options } from './types.h';
import {
  NodeList,
  Node,
  NodeTitle,
  NodeContent,
  Panel,
  Checkbox,
  Input,
  NodeButton,
} from './components';
import { ObjectView } from './object-view';
import { createJsonSetting, createSetting } from './setting';
import { trimDomain } from './trim-domain';

const defaultKinds: Kind[] = ['event', 'store'];
const kindSetting = createJsonSetting<Kind[]>('filter-kinds', defaultKinds);
const textSetting = createSetting('filter-text', '');

export function Logs($logs: Store<LogMeta[]>, hotKeyClear: Event<void>, options: Options) {
  const toggleKind = createEvent<Kind>();
  const filterChanged = createEvent<string>();
  const clearClicked = createEvent<MouseEvent>();

  const $kinds = createStore(kindSetting.read(),{serialize:'ignore'});
  const $filterText = createStore(textSetting.read(), {serialize:'ignore'}).on(filterChanged, (_, filterText) => filterText)

  $kinds
    .on(toggleKind, (exist, toggled) =>
      exist.includes(toggled) ? exist.filter((i) => i !== toggled) : [...exist, toggled],
    )
    .watch(kindSetting.write);
  $filterText.watch(textSetting.write);
  $logs.on(clearClicked, () => []).on(hotKeyClear, () => []);

  Panel(() => {
    h('span', { text: 'Show: ' });
    Checkbox({
      title: 'Event',
      attr: { checked: $kinds.map((list) => list.includes('event')) },
      handler: { click: toggleKind.prepend(() => 'event') },
    });
    Checkbox({
      title: 'Store',
      attr: { checked: $kinds.map((list) => list.includes('store')) },
      handler: { click: toggleKind.prepend(() => 'store') },
    });
    Checkbox({
      title: 'Effect',
      attr: { checked: $kinds.map((list) => list.includes('effect')) },
      handler: { click: toggleKind.prepend(() => 'effect') },
    });

    h('span', { text: 'Filter:' });
    Input({
      attr: { value: $filterText },
      handler: {
        change: filterChanged.prepend((event) => (event.currentTarget as any)?.value ?? ''),
      },
    });

    NodeButton({
      text: 'Clear',
      handler: { click: clearClicked },
      attr: { title: 'Press CTRL+L to clear logs' },
    });
  });

  NodeList(() => {
    list({
      source: $logs,
      key: 'id',
      fields: ['kind', 'name', 'payload', 'datetime'],
      fn({ fields: [$kind, $rawName, $payload, $datetime] }) {
        const $name = trimDomain($rawName, options);
        const $kindMatched = combine($kind, $kinds, (current, visible) =>
          visible.includes(current),
        );
        const $textMatched = combine($filterText, $name, (filter, name) => name.includes(filter));
        const $visible = combine($kindMatched, $textMatched, (kind, text) => kind && text);

        Node({
          visible: $visible,
          fn() {
            const $iso = $datetime.map((date) => date.toISOString());
            const $time = $datetime.map((date) => date.toLocaleTimeString());

            NodeTitle({ text: [$time, ' ▸ '], attr: { title: $iso } });
            NodeTitle({ text: $kind as Store<string> });
            NodeTitle({ text: [' «', $name, '» '] });
            NodeContent(() => ObjectView({ value: $payload }));
          },
        });
      },
    });
  });
}
