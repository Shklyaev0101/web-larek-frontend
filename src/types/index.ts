// Типы для каждого элемента

// Тип для объекта, который храненит данные, соответствующие категориям товаров
export type CategoryConfig = {
	[key: string]: {
		// Строка - одна из категорий
		label: string; // Текстовое описание категории
		color: string; // Цвет фона для категории
	};
};

// Тип для состояния приложения
export type IAppState = {
	basket: string[]; // Массив ID товаров в корзине
	catalog: IProduct[]; //IProductListResponse[]; // Массив товаров в каталоге
	order: IOrder; // Заказ пользователя
	preview: string | null; // Предварительный просмотр товара
	formErrors: IFormErrors; // Ошибки формы
};

// Тип для товара
export type IProduct = {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
};

// Тип для ответа на запрос списка продуктов,
// который включает общее количество товаров и массив товаров
export type IProductListResponse = {
	total: number;
	items: IProduct[];
};

// Тип для тела запроса на создание заказа
export type IOrder = {
	payment: 'online' | 'cash';
	email: string;
	phone: string;
	address: string;
	total: number;
	items: string[]; // Массив id продуктов
};

// Тип для ответа на запрос создания заказа
export type IOrderResult = {
	id: string;
	total: number;
};

// Тип данных формы (без total и items)
export type IOrderForm = Omit<IOrder, 'total' | 'items'>;

// Тип ошибок формы
export type IFormErrors = Partial<Record<keyof IOrderForm, string>>;
