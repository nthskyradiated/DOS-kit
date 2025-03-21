import type { Actions, PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import { Argon2id } from '@/lib/utils/argon2id';
import { redirect } from 'sveltekit-flash-message/server';
import { message, superValidate } from 'sveltekit-superforms/client';
import { route } from '$lib/router';
import { usersTable } from '@/db/schema';
import type { AlertMessageType } from '@/lib/types';
import { db } from '@/db/index';
import {
	PasswordResetZodSchema,
	type passwordResetZodSchema
} from '@/lib/zodValidators/zodAuthValidation';
import { passwordResetDashboardPageActionRateLimiter } from '@/lib/server/rateLimiterUtils';
import { zod } from 'sveltekit-superforms/adapters';
import {
	deleteSessionTokenCookie,
	getUserSessions,
	invalidateSession,
	isSameAsOldPassword
} from '@/lib/server/authUtils';

export const load = (async (event) => {
	console.log('event:', event.locals.user);
	const { locals, cookies } = event;
	if (!locals.user) {
		throw redirect(
			route('/auth/login'),
			{
				type: 'error',
				message: 'You must be logged in to view the dashboard.'
			},
			cookies
		);
	}
	await passwordResetDashboardPageActionRateLimiter.cookieLimiter?.preflight(event);
	return {
		loggedInUser: locals.user,
		passwordResetFormData: await superValidate(zod(PasswordResetZodSchema))
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	logout: async ({ cookies, locals }) => {
		if (!locals.session?.id) return;

		invalidateSession(locals.session.id);
		deleteSessionTokenCookie(cookies);

		throw redirect(303, '/');
	},

	changePassword: async (event) => {
		const userId = event.locals.user?.id;
		const currentSessionId = event.locals.session?.id;

		if (!userId) return;

		const passwordResetFormData = await superValidate<passwordResetZodSchema, AlertMessageType>(
			event.request,
			zod(PasswordResetZodSchema)
		);

		if (passwordResetFormData.valid === false) {
			return message(passwordResetFormData, {
				alertType: 'error',
				alertText: 'There was a problem with your submission.'
			});
		}
		try {
			// Check if the rate limit for password reset action has been exceeded
			const passwordResetActionRateLimiterResult =
				await passwordResetDashboardPageActionRateLimiter.check(event);

			// If the rate limit has been exceeded, return an error message
			if (passwordResetActionRateLimiterResult.limited) {
				return message(
					passwordResetFormData,
					{
						alertType: 'error',
						alertText: `You have made too many requests and exceeded the rate limit. Please try again after ${passwordResetActionRateLimiterResult.retryAfter} seconds.`
					},
					{
						status: 429 // Too Many Requests
					}
				);
			}
			const isSamePassword = await isSameAsOldPassword(
				userId,
				passwordResetFormData.data.newPassword
			);

			if (isSamePassword) {
				return message(
					passwordResetFormData,
					{
						alertType: 'error',
						alertText: 'Your new password cannot be the same as your old password.'
					},
					{
						status: 400 // This status code indicates that the server could not understand the request due to invalid syntax (new password is the same as the old password).
					}
				);
			}

			const allUserSessions = await getUserSessions(userId);

			// Invalidate all user sessions except the current session for security reasons
			for (const session of allUserSessions) {
				if (session.id === currentSessionId) continue;

				await invalidateSession(session.id);
			}

			// Hash the new password
			const hashedPassword = await new Argon2id().hash(passwordResetFormData.data.newPassword);

			await db
				.update(usersTable)
				.set({ password: hashedPassword })
				.where(eq(usersTable.id, userId));
		} catch (error) {
			console.error('Error in resetPassword action:', error);
			return message(
				passwordResetFormData,
				{
					alertType: 'error',
					alertText: 'There was a problem with your submission.'
				},
				{
					status: 500
				}
			);
		}

		return message(passwordResetFormData, {
			alertType: 'success',
			alertText: 'Your password has been reset successfully.'
		});
	}
};
