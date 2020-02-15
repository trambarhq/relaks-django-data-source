import { GenericEvent } from 'relaks-event-emitter';

class RelaksDjangoDataSourceEvent extends GenericEvent {
}

export {
  RelaksDjangoDataSourceEvent,
  RelaksDjangoDataSourceEvent as DataSourceEvent,
};
