import type { HTMLButtonAttributes, HTMLInputAttributes } from 'svelte/elements';
import type { SuperValidated } from 'sveltekit-superforms';
import type { passwordResetZodSchema } from './zodValidators/zodAuthValidation';
import type { Snippet } from 'svelte';

export type AlertMessageType = {
	alertType: 'success' | 'error' | 'warning' | 'info';
	alertText: string;
};

export type EnterKeyHintType =
	| 'search'
	| 'enter'
	| 'done'
	| 'go'
	| 'next'
	| 'previous'
	| 'send'
	| null
	| undefined;

// Type for prettifying an object type
export type PrettifyType<T> = {
	[K in keyof T]: T[K];
} & Record<string, never>;

export type EmailParams = {
	email: string;
	subject: string;
	htmlContent: string;
};

export type PendingVerificationUserDataType = {
	id: string;
	email: string;
};

export type GitHubUser = {
	id: number;
	login: string;
	avatar_url: string;
	name: string;
};

export type GitHubEmail = {
	email: string;
	primary: boolean;
	verified: boolean;
	visibility: string | null;
};

export type GoogleUser = {
	sub: string;
	name: string;
	given_name: string;
	family_name: string;
	picture: string;
	email: string;
	email_verified: boolean;
	locale: string;
};

export type InputFieldProps = {
	type: HTMLInputAttributes['type'];
	value: string | number | null | undefined;
	name: string;
	label?: string;
	placeholder?: string;
	spellcheck?: boolean;
	autocomplete?: string;
	enterkeyhint?: EnterKeyHintType;
	maxlength?: number | undefined;
	minlength?: number | undefined;
	errorMessage?: object | undefined;
	className?: HTMLInputAttributes['class'];
	step?: HTMLInputAttributes['step'];
};

export type PasswordChangeFormProps = {
	formData: SuperValidated<passwordResetZodSchema>;
	isPasswordResetTokenRequired?: boolean;
	formAction: string;
};

export type BtnProps = {
	disabled?: boolean;
	formaction?: string | null;
	showSpinner?: boolean | null;
	// class?: string | HTMLButtonAttributes['class']
	className?: HTMLButtonAttributes['class'];
	children: Snippet;
};
