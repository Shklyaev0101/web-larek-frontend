// components/common/WebLarekApi.ts
import { Api, ApiListResponse } from './api';
import { IProduct, IOrder, IOrderResult } from '../../types';

// Интерфейс взаимодействия с API магазина
export interface IShopAPI {
	getProductList(): Promise<IProduct[]>;
	getProductItem(id: string): Promise<IProduct>;
	placeOrder(order: IOrder): Promise<IOrderResult>;
}

// Класс для работы с API WebLarek
export class WebLarekApi extends Api implements IShopAPI {
	readonly cdn: string;

	constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	// Получить список всех товаров
	getProductList(): Promise<IProduct[]> {
		return this.get('/product')
			.then((data) => (data as ApiListResponse<IProduct>).items);
	}

	// Получить подробную информацию о товаре
	getProductItem(id: string): Promise<IProduct> {
		return this.get(`/product/${id}`).then((data) => data as IProduct);
	}

	// Отправить заказ
	placeOrder(order: IOrder): Promise<IOrderResult> {
		return this.post('/order', order).then((data) => data as IOrderResult);
	}
}