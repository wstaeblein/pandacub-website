<script>
    import { createEventDispatcher } from "svelte";
    import ClickOutside from './ClickOutside.svelte';
	
    export let value;
    export let setup;
    export let id = '';
    let list = [];

    const dispatch = createEventDispatcher();

    var dropDown = {
        active: false,
        chosen: setup.data.find((d) => d.val == value)
    }

    function dropDownClick(evt, arg) {
        if (arg != undefined) { 
            dropDown.active = arg;
        } else {
            dropDown.active = !dropDown.active;
        }
	}

    function itemClick(item) {
        return function() { 
            value = item.val;
            dropDown.chosen = item;
            dispatch("minidropdown", value);
            dropDownClick(null, false);
        }
    }

    function onClickOutside() { 
        dropDownClick(null, false);
    }

    function setList(actual) {
        list = setup.data.filter((d) => d.val != actual);
    }

    $: setList(value);
</script>

{#if setup}
    <ClickOutside on:clickoutside={onClickOutside}>
        <div class="minidropdown" class:active="{ dropDown.active }">
            <a href title="{ setup.title }" on:click|preventDefault={dropDownClick} class="chosen">
                {#if dropDown.chosen.type === 'img'}
                    <span class="img" title="{ dropDown.chosen.txt }"><img src="{ dropDown.chosen.img }" alt="{ dropDown.chosen.txt }"></span>
                {:else if dropDown.chosen.type === 'color'}
                    <span style="background-color: { dropDown.chosen.color }" class="color" title="{ dropDown.chosen.txt }"></span>
                {:else}
                    <span class="{ dropDown.chosen.class }" title="{ dropDown.chosen.txt }"></span>
                {/if}
            </a>
            <!-- <ul class="{ setup.mainclass }" style="width: 126px"> -->
            <ul class="{ setup.mainclass }">
                {#each list as item, i}
                    <li>
                        <a href on:click|preventDefault={itemClick(item)}>
                            {#if item.type === 'img'}
                                <span class="img" title="{ item.txt }"><img src="{ item.img }" alt="{ item.txt }"></span>
                            {:else if item.type === 'color'}
                                <span style="background-color: { item.color }" class="color" title="{ item.txt }"></span>
                            {:else}
                                <span class="icon { item.class }" title="{ item.txt }"></span>
                            {/if}
                        </a>
                    </li>
    <!--                 {#if i % 3 == 2}
                    <br>
                    {/if} -->
                {/each}
            </ul>
        </div>
    </ClickOutside>
{/if}

<style>
    .minidropdown {
        width: 100%;
        height: 100%;
        position: relative;
        text-align: center;
        margin: 0 2px 0 0;
    }

    .minidropdown > a {
        font-size: 25px;
        display: inline-block;
        width: 100%;
        height: 100%;
        text-align: center;
        color: #323232;
        text-decoration: none;
        position: relative;
    }

    .minidropdown > a > span.icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translateY(-50%) translateX(-50%);
    }

    .minidropdown > a > span.img {
        width: 100%;
        height: 100%;
        display: inline-block;
    }

    .minidropdown > a > span.img > img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .minidropdown ul {
        width: 100%;
        padding: 0;
        margin: 0;
        list-style: none;
        background-color: #fff;
        font-size: 30px;
        text-align: center;
        position: absolute;
        box-shadow: 0 0 5px 1px #202020AA;
        display: none;
    }

    .minidropdown.active ul {
        display: block;
    }

    .minidropdown ul > li {
        text-align: left;
        transition: all 0.4s ease;
        padding: 0 3px;
        display: inline-block;
    }

    .minidropdown ul > li:hover {
        background-color: #442266;
    }
        .minidropdown ul > li:hover > a {
            color: #fff;
        }

    .minidropdown ul > li > a {
        white-space: nowrap;
        text-decoration: none;
        display: flex;
        padding: 3px 0;
        color: #323232;

    }

    .minidropdown ul.colors > li > a {
        justify-content: center;
        display: inline-block;
        width: 100%;
        height: 100%;
    }

    .minidropdown ul.colors > li > a > span.color,
    .minidropdown a.chosen > span.color {
        width: 84%;
        height: 84%;
        padding: 8%;
        border-radius: 8px;
        display: inline-block;
        border: 1px solid #dfdfdf;
        color: inherit;
    }
    .minidropdown ul.icons > li > a > span.text {
        font-size: 16px;
        font-weight: normal;
        padding-left: 10px;
    }

    span.img,
    span.img > img {
        display: inline-block;
        width: 100%;
        height: 100%;
    }
</style>