import { Component } from '../base/component';

export interface ISuccessActions {
	onClick: () => void;
}

export interface ISuccess {
	total: number;
}

export class Success extends Component<ISuccess> {
	private _close: HTMLButtonElement;
	private _description: HTMLElement;
	private actions: ISuccessActions;

	constructor(container: HTMLElement, actions: ISuccessActions) {
		super(container);
		this.actions = actions;

		this._close = this.container.querySelector(
			'.order-success__close'
		) as HTMLButtonElement;
		this._description = this.container.querySelector(
			'.order-success__description'
		) as HTMLElement;

		if (this._close) {
			this._close.addEventListener('click', () => {
				this.actions.onClick();
			});
		}
	}

	override render(data: ISuccess): HTMLElement {
		this.setText(this._description, `Списано ${data.total} `);
		return this.container;
	}
}
