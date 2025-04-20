import { IOrderForm } from '../../types';
// Хорошая практика даже простые типы выносить в алиасы
// Зато когда захотите поменять это достаточно сделать в одном месте
type EventName = string | RegExp;
type Subscriber = Function;
type EmitterEvent = {
	eventName: string;
	data: unknown;
};

interface EventMap {
	'form:change': { field: keyof IOrderForm; value: string };
	'form:submit': undefined;
	'state:changed': undefined;
	'preview:changed': undefined;
	'basket:changed': undefined;
  'modal:open': undefined;    // событие для открытия modal
	'modal:close': undefined;   // событие для закрытия modal
	'basket:open': undefined;   // событие для открытия basket
	// можно добавить еще события при необходимости
}

export interface IEvents {
	on<K extends keyof EventMap>(
		event: K,
		callback: (data: EventMap[K]) => void
	): void;
	emit<K extends keyof EventMap>(event: K, data?: EventMap[K]): void;
	trigger<K extends keyof EventMap>(
		event: K,
		context?: Partial<EventMap[K]>
	): (data: EventMap[K]) => void;
}

export class EventEmitter implements IEvents {
	private _events = new Map<EventName, Set<Subscriber>>();

	on<K extends keyof EventMap>(
		eventName: K,
		callback: (event: EventMap[K]) => void
	) {
		if (!this._events.has(eventName)) {
			this._events.set(eventName, new Set());
		}
		this._events.get(eventName)!.add(callback);
	}

	off(eventName: EventName, callback: Subscriber) {
		this._events.get(eventName)?.delete(callback);
		if (this._events.get(eventName)?.size === 0) {
			this._events.delete(eventName);
		}
	}

	emit<K extends keyof EventMap>(eventName: K, data?: EventMap[K]) {
		this._events.get(eventName)?.forEach((callback) => callback(data));
	}

	trigger<K extends keyof EventMap>(
		eventName: K,
		context?: Partial<EventMap[K]>
	) {
		return (event: Partial<EventMap[K]> = {}) => {
			this.emit(eventName, {
				...(event || {}),
				...(context || {}),
			} as EventMap[K]);
		};
	}

	onAll(callback: (event: EmitterEvent) => void) {
		throw new Error('onAll method is no longer available');
	}

	offAll() {
		this._events.clear();
	}
}
