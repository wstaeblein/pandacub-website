<script>
    import ClickOutside from './ClickOutside.svelte';
	
    export let value;
    export let setup;

    var dropDown = {
        active: false,
        chosen: setup.data[0]
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
            dropDownClick(null, false);
        }

    }

    function onClickOutside() { 
        dropDownClick(null, false);
    }
</script>

{#if setup}
    <ClickOutside on:clickoutside={onClickOutside}>
        <div class="dropdown" class:active="{ dropDown.active }">
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
                {#each setup.data as item, i}
                    <li>
                        <a href on:click|preventDefault={itemClick(item)}>
                            {#if item.type === 'img'}
                                <span class="img" title="{ item.txt }"><img src="{ item.img }" alt="{ item.txt }"></span>
                            {:else if item.type === 'color'}
                                <span style="background-color: { item.color }" class="color" title="{ item.txt }"></span>
                            {:else}
                                <span class="{ item.class }" title="{ item.txt }"></span>
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
    .dropdown {
        width: 38px;
        height: 38px;
        background-color: #fff;
        position: relative;
        text-align: center;
        margin: 0 2px 0 0;
    }

    .dropdown > a {
        font-size: 25px;
        display: inline-block;
        width: 100%;
        height: 100%;
        text-align: center;
        color: #323232;
        text-decoration: none;
        position: relative;
    }

    .dropdown > a > span {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translateY(-50%) translateX(-50%);
    }

    .dropdown ul {
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

    .dropdown.active ul {
        display: block;
    }

    .dropdown ul > li {
        text-align: left;
        transition: all 0.4s ease;
        padding: 3px 6px;
        display: inline-block;
    }

    .dropdown ul > li:hover {
        background-color: #442266;
    }
        .dropdown ul > li:hover > a {
            color: #fff;
        }

    .dropdown ul > li > a {
        white-space: nowrap;
        text-decoration: none;
        display: flex;
        padding: 3px 0;
        color: #323232;
    }

    .dropdown ul.colors > li > a {
        justify-content: center;
    }

    .dropdown ul.colors > li > a > span.color,
    .dropdown a.chosen > span.color {
        width: 20px;
        height: 20px;
        border-radius: 4px;
        display: inline-block;
        border: 1px solid #dfdfdf;
        color: inherit;
    }
    .dropdown ul.icons > li > a > span.text {
        font-size: 16px;
        font-weight: normal;
        padding-left: 10px;
    }
</style>