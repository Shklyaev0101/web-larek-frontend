import { Api, ApiListResponse } from '../base/api';
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

	private withCDN<T extends { image: string }>(item: T): T {
		return {
			...item,
			image: this.cdn + item.image,
		};
	}

	// Получить список всех товаров
	getProductList(): Promise<IProduct[]> {
		return this.get('/product').then((data) => {
			console.log(data);
			const items = (data as ApiListResponse<IProduct>).items;
			return items.map(this.withCDN.bind(this));
		});
	}

	// Получить подробную информацию о товаре
	getProductItem(id: string): Promise<IProduct> {
		return this.get(`product/${id}`).then((data) =>
			this.withCDN(data as IProduct)
		);
	}

	// Отправить заказ
	placeOrder(order: IOrder): Promise<IOrderResult> {
		return this.post('/order', order).then((data) => data as IOrderResult);
	}
}
