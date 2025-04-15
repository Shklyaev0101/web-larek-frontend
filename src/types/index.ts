// Типы для каждого элемента

// Тип для товара
type Product = {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
  };
  
  // Тип для ответа на запрос списка продуктов, 
  // который включает общее количество товаров и массив товаров
  type ProductListResponse = {
    total: number;
    items: Product[];
  };
  
  // Тип для тела запроса на создание заказа
  type Order = {
    payment: 'online' | 'cash';
    email: string;
    phone: string;
    address: string;
    total: number;
    items: string[]; // Массив id продуктов
  };
  
  // Тип для ответа на запрос создания заказа
  type OrderResponse = {
    id: string;
    total: number;
  };

  // Тип данных формы (без total и items)
  type Form = Omit<Order, 'total' | 'items'>;

  // Тип ошибок формы
  type FormErrors = Partial<Record<keyof FormData, string>>;