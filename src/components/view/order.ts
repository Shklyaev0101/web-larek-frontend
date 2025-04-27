import { EventEmitter } from '../base/events';
import { Form } from './form';

interface IOrderForm {
	phone: string;
	email: string;
}

export class Order extends Form<IOrderForm> {
	private phoneInput: HTMLInputElement;
	private emailInput: HTMLInputElement;

	constructor(container: HTMLFormElement, events: EventEmitter) {
		super(container, events);

		this.phoneInput = this.container.querySelector<HTMLInputElement>(
			'input[name="phone"]'
		);
		this.emailInput = this.container.querySelector<HTMLInputElement>(
			'input[name="email"]'
		);

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
		if (fieldName === 'phone' && this.phoneInput) {
			this.phoneInput.value = value;
		} else if (fieldName === 'email' && this.emailInput) {
			this.emailInput.value = value;
		}
	}
}
