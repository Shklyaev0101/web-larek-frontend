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
	'modal:open': undefined; // событие для открытия modal
	'modal:close': undefined; // событие для закрытия modal
	'basket:open': undefined; // событие для открытия basket
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

/**
 * Брокер событий, классическая реализация
 * В расширенных вариантах есть возможность подписаться на все события
 * или слушать события по шаблону например
 */
export class EventEmitter implements IEvents {
	_events: Map<EventName, Set<Subscriber>>;

	constructor() {
		this._events = new Map<EventName, Set<Subscriber>>();
	}

	/**
	 * Установить обработчик на событие
	 */
	on<T extends object>(eventName: EventName, callback: (event: T) => void) {
		if (!this._events.has(eventName)) {
			this._events.set(eventName, new Set<Subscriber>());
		}
		this._events.get(eventName)?.add(callback);
	}

	/**
	 * Снять обработчик с события
	 */
	off(eventName: EventName, callback: Subscriber) {
		if (this._events.has(eventName)) {
			this._events.get(eventName)!.delete(callback);
			if (this._events.get(eventName)?.size === 0) {
				this._events.delete(eventName);
			}
		}
	}

	/**
	 * Инициировать событие с данными
	 */
	emit<T extends object>(eventName: string, data?: T) {
		this._events.forEach((subscribers, name) => {
			if (name === '*')
				subscribers.forEach((callback) =>
					callback({
						eventName,
						data,
					})
				);
			if (
				(name instanceof RegExp && name.test(eventName)) ||
				name === eventName
			) {
				subscribers.forEach((callback) => callback(data));
			}
		});
	}

	/**
	 * Слушать все события
	 */
	onAll(callback: (event: EmitterEvent) => void) {
		this.on('*', callback);
	}

	/**
	 * Сбросить все обработчики
	 */
	offAll() {
		this._events = new Map<string, Set<Subscriber>>();
	}

	/**
	 * Сделать коллбек триггер, генерирующий событие при вызове
	 */
	trigger<T extends object>(eventName: string, context?: Partial<T>) {
		return (event: object = {}) => {
			this.emit(eventName, {
				...(event || {}),
				...(context || {}),
			});
		};
	}
}
