import { CategoryConfig } from '../types';

export const API_URL = `${process.env.API_ORIGIN}/api/weblarek`;
export const CDN_URL = `${process.env.API_ORIGIN}/content/weblarek`;

export const CATEGORY_CONFIG: CategoryConfig = {
	soft: {
		label: 'софт-скил', // или подходящий текст для категории
		color: '#F0F0F0', // значение цвета из $category1 в SCSS
	},
	hard: {
		label: 'хард-скил',
		color: '#A0A0A0', // значение цвета из $category5 в SCSS
	},
	other: {
		label: 'другое',
		color: '#D0D0D0', // значение цвета из $category2 в SCSS
	},
	additional: {
		label: 'дополнительное',
		color: '#C0C0C0', // значение цвета из $category3 в SCSS
	},
	button: {
		label: 'кнопка',
		color: '#B0B0B0', // значение цвета из $category4 в SCSS
	},
};

// Сообщения об ошибках в формах при оформлении заказа
export interface IFormErrors {
	email?: string;
	phone?: string;
	address?: string;
	[key: string]: string | undefined; // Поддержка динамических ошибок
}

export const FORM_ERRORS: IFormErrors = {
	required: 'Это поле обязательно для заполнения.',
	email: 'Введите правильный адрес электронной почты.',
	phone: 'Номер телефона должен быть в формате: +7 (XXX) XXX-XX-XX',
	address: 'Введите ваш адрес для доставки.',
	// Добавляем другие типы ошибок (при необходимости)
};
