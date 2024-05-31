<script lang="ts">
	import type { PageData } from './$types';
	import * as Avatar from '$lib/components/ui/avatar';
	import { route } from '@/lib/router';
	import PasswordChangeForm from '@/lib/components/form/PasswordChangeForm.svelte';
	import Card from '@/lib/components/ui/card/card.svelte';
	export let data: PageData;

	const { loggedInUser } = data;

	const nameInitial = data.user?.name?.charAt(0).toUpperCase();
	const emailInitial = data.user?.email.charAt(0).toUpperCase();
	const isOnlyOauthUser = !loggedInUser.authMethods.includes('email');
</script>

<section class="mx-auto my-12 w-80 gap-4 md:ml-12 md:w-full">
	<div class="flex flex-col gap-8">
		<h1 class="mb-5 text-2xl">
			<span class="font-bold"
				>{loggedInUser.name || loggedInUser.username || loggedInUser.email}'s Dashboard</span
			>
		</h1>

		<Card
			class="flex w-full flex-col justify-center gap-8 px-6 py-8 sm:gap-2 md:max-w-md md:flex-row"
		>
			<div class="flex w-full flex-col gap-4">
				<Avatar.Root class="size-20">
					<Avatar.Image src={data.user?.avatarUrl} alt="User Avatar" />
					<Avatar.Fallback class="text-5xl">
						{nameInitial || emailInitial}
					</Avatar.Fallback>
				</Avatar.Root>
				<div class="flex gap-2">
					{#if isOnlyOauthUser === false}
						<PasswordChangeForm
							formData={data.passwordResetFormData}
							formAction={route('changePassword /dashboard')}
						/>
					{/if}
				</div>
			</div>
			<div class="flex w-full flex-col gap-2">
				<p>Email: {loggedInUser.email}</p>
				<p>Name: {loggedInUser.name}</p>
				<p>Username: {loggedInUser.username}</p>
			</div>
		</Card>
	</div>
</section>
