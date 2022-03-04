<script lang="ts">
  import { useLanyard } from "svelte-lanyard";
  const data = useLanyard("831903326748540928");
</script>

<main>
	{#if $data}

	<div>
		<img class="rounded-full absolute ml-auto mr-auto left-0 right-52 w-30 mt-20" src="https://cdn.discordapp.com/avatars/{$data.discord_user.id}/{$data.discord_user.avatar}.png" alt="{$data.discord_user.username}">
		{#if $data.discord_status === 'dnd'}
		<div class="bg-red-500 rounded-full w-6 h-6 absolute ml-auto mr-auto left-24 right-52 mt-44 border-solid border-[#2A2A2A] border-4" />
		{/if}
		{#if $data.discord_status === 'online'}
		<div class="bg-green-500 rounded-full w-6 h-6 absolute ml-auto mr-auto left-24 right-52 mt-44 border-solid border-[#2A2A2A] border-4" />
		{/if}
		{#if $data.discord_status === 'idle'}
		<div class="bg-yellow-500 rounded-full w-6 h-6 absolute ml-auto mr-auto left-24 right-52 mt-44 border-solid border-[#2A2A2A] border-4" />
		{/if}
		{#if $data.discord_status === 'offline'}
		<div class="bg-gray-500 rounded-full w-6 h-6 absolute ml-auto mr-auto left-24 right-52 mt-44 border-solid border-[#2A2A2A] border-4" />
		{/if}
	</div>

	<div class="text-white">
		<center>
			<h2 class="text-3xl absolute ml-auto mr-auto left-16 right-0 top-32"> {$data.discord_user.username} <span class="opacity-60 absolute text-xl top-1.5">#{$data.discord_user.discriminator} </span> </h2>
			<p class="text-sm absolute ml-auto mr-auto left-28 right-0 top-[165px] opacity-70">Front-end Developer</p>
		</center>
	</div>

	<div class="absolute ml-auto mr-auto left-0 right-40 top-64">
		<center>
			<h2 class="text-white text-4xl">About me</h2>
		</center>
	</div>
	<div class="w-[350px] h-40 rounded-sm flex-col drop-shadow-lg bg-[#383838] flex absolute ml-auto mr-auto left-0 right-0 top-80">
		<center>
			<p class="absolute text-white text-sm left-0 px-2 py-2 top-2">I'm stachy. I am self-taught and front-end developer. I do projects and I share these projects on my Github account. You can check out my Github account by clicking the link below.</p>
			<a href="https://github.com/st4chy" class="absolute text-white text-sm left-5 opacity-70 top-32 underline">Github ↬</a>
		</center>
	</div>

	<div class="absolute ml-auto mr-auto left-0 right-28 top-[550px]">
		<center>
			<h2 class="text-white text-4xl">Best Projects</h2>
		</center>
	</div>
	<div class="w-[350px] h-28 rounded-sm flex-col drop-shadow-lg bg-[#383838] flex absolute ml-auto mr-auto left-0 right-0 top-[610px]">
		<center>
			<h1 class="absolute text-white text-sm opacity-60 left-5 top-2">2022 - achyStorage</h1>
			<p class="absolute text-white text-sm left-5 top-10">It is a simple and plain photo upload site.</p>
			<a href="https://achystorage.rick-roll.xyz" class="absolute text-white text-sm left-5 opacity-70 top-20 underline">Try it out! ↬</a>
		</center>
	</div>
	<div class="w-[350px] h-28 rounded-sm flex-col drop-shadow-lg bg-[#383838] flex absolute ml-auto mr-auto left-0 right-0 top-[750px]">
		<center>
			<h1 class="absolute text-white text-sm opacity-60 left-5 top-2">2022 - achyAPI</h1>
			<p class="absolute text-white text-sm left-5 top-10">Generates random api.</p>
			<a href="http://achyapi.rick-roll.xyz" class="absolute text-white text-sm left-5 opacity-70 top-20 underline">Try it out! ↬</a>
		</center>
	</div>

    {:else}
	<h3 class="text-white text-3xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"> Please wait...</h3>
    {/if}
</main>
