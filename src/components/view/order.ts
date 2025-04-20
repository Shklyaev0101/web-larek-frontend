import { EventEmitter } from '../base/events';
import { Form } from './form';

interface IOrderForm {
  phone: string;
  email: string;
}

export class Order extends Form<IOrderForm> {
  constructor(events: EventEmitter) {
    super('order',events);

    // Обработка изменения значений полей формы
    this.container.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!target.name) return;

      this.onInputChange(target.name as keyof IOrderForm, target.value);
    });

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
    const input = this.container.querySelector<HTMLInputElement>('input[name="phone"]');
    if (input) {
      input.value = value;
    }
  }

  /**
   * Устанавливает значение поля email
   */
  set email(value: string) {
    const input = this.container.querySelector<HTMLInputElement>('input[name="email"]');
    if (input) {
      input.value = value;
    }
  }
}