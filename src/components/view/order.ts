import { EventEmitter } from '../base/events';
import { Form } from './form';

interface IOrderForm {
	phone: string;
	email: string;
}

export class Order extends Form<IOrderForm> {
	constructor(container: HTMLFormElement, events: EventEmitter) {
		super(container, events);

		// Обработка отправки формы
		this.container.addEventListener('submit', (e: Event) => {
			e.preventDefault();
			this.events.emit('form:submit');
		});
	}

	/**
	 * Устанавливает значение поля телефона
	 */
	set phone(value: string) {
		this.updateFieldValue('phone', value);
	}

	set email(value: string) {
		this.updateFieldValue('email', value);
	}

	/**
	 * Устанавливает значение поля email
	 */
	private updateFieldValue(fieldName: keyof IOrderForm, value: string) {
		const input = this.container.querySelector<HTMLInputElement>(
			`input[name="${fieldName}"]`
		);
		if (input) {
			input.value = value;
		}
	}
}
