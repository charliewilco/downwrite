import cuid from "cuid";
import { BehaviorSubject } from "rxjs";

export enum NotificationType {
	DEFAULT = "DEFAULT",
	ERROR = "ERROR",
	WARNING = "WARNING"
}

export class UINotificationMessage {
	public id: string = cuid();
	public text: string;
	public dateAdded: number = Date.now();
	public type: NotificationType;
	public dismissable: boolean;
	constructor(text: string, type?: NotificationType, dismissable?: boolean) {
		this.text = text;
		this.type = type || NotificationType.DEFAULT;
		this.dismissable = dismissable || false;
	}
}

export class GlobalNotifications {
	subject: BehaviorSubject<UINotificationMessage[]>;
	#_list: UINotificationMessage[] = [];
	constructor() {
		this.subject = new BehaviorSubject<UINotificationMessage[]>([...this.#_list]);
	}

	getAll() {
		return this.#_list;
	}

	#_add(text: string, variant?: NotificationType, dismissable?: boolean) {
		this.#_list.unshift(new UINotificationMessage(text, variant, dismissable));
		this.subject.next(Array.from(this.#_list));
	}
	#_remove(id: string) {
		const index = this.#_list.findIndex((n) => n.id === id);

		if (index > -1) {
			this.#_list.splice(index, 1);
		}
	}

	warn(text: string, dismissable?: boolean) {
		this.#_add(text, NotificationType.WARNING, dismissable);
	}

	error(text: string, dismissable?: boolean) {
		this.#_add(text, NotificationType.ERROR, dismissable);
	}

	add(text: string, dismissable?: boolean) {
		this.#_add(text, NotificationType.DEFAULT, dismissable);
	}

	remove(id: string) {
		this.#_remove(id);
		this.subject.next(Array.from(this.#_list));
	}
}
