<script>
    import { tick, onMount } from "svelte";
    import { fade } from 'svelte/transition';
    import { component_subscribe, hasContext, listen } from "svelte/internal";
    import { Email, HackerNews, Reddit, LinkedIn, Pinterest, Telegram, WhatsApp, Facebook, Twitter } from 'svelte-share-buttons-component';
    import Minidropdown from './Minidropdown.svelte';

    let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent); console.log(navigator.userAgent, isMobile)
    let tmstart = new Date().getTime();
    let waitTime = 1200;
    let menuActive  =false;
    let menuClosing = false;
    let showAfter = false;
    let formMode = 0;
    let myForm;
    let downloads = [],
        langData = {},
        data = {},
        menu = [],
        langList = {},
        ready = false;
    let currLang = localStorage.getItem("currlang") || (navigator.language || navigator.userLanguage).split("-").shift() || "en";
    let donateUrl = '';
    let seourl = 'https://pandacub.app';
    let openSocial = false;
    var mddSetup = {
        active: false,
        title: "icons",
        mainclass: "colors",
        data: [],
    };


    // PANDACUB MAIL
    // LOGIN: walter@pandacub.app
    // PWD: Ei]ohxOyp*vtawmndrfgj4zcqlk0be

    $: if (ready) { setTimeout(() => { showAfter = true; }, 300)};

    window.addEventListener('scroll', function() { 
        if (window.scrollY > window.innerHeight * 0.5) {
            document.querySelector('.back2top').classList.remove('vanish');
        } else {
            document.querySelector('.back2top').classList.add('vanish');
        }
    });

    async function load() {
        try {
            let p1 = new Promise(async (resolve) => {
                try {
                    let resp = await fetch("/data.json");
                    let json = await resp.json();
                    resolve(json);
                } catch (error) {
                    console.log("GET DATA");
                    console.log(error);
                    resolve("");
                }
            });
            let p2 = new Promise(async (resolve) => {
                try {
                    let tmp = await setLang(currLang);
                    resolve(tmp);
                } catch (error) {
                    console.log("SET LANG");
                    console.log(error);
                    resolve("");
                }
            });
            let resp = await Promise.all([p1, p2]);
            let curSys = getOSInfo();

            data = resp[0]; 
            langData = resp[1]; 
            prepDonationURL();

            mddSetup.data = data.languages.map((d) => {
                return {
                    val: d.code,
                    txt: d.name,
                    img: "/img/flags/" + d.code + ".png",
                    type: "img",
                };
            });

            data.downloads.forEach((ele) => {
                if (ele.os.toLowerCase() == curSys.os) {
                    ele.actual = true;
                }
                if (curSys.arch) {
                    ele.list.forEach(
                        (l) => (l.actual = curSys.arch == l.arch.toLowerCase())
                    );
                }
            });
            downloads = data.downloads;

            let remainder = new Date().getTime() - tmstart; 
            if (remainder > waitTime) {
                ready = true;
            } else {
                setTimeout(() => { ready = true; }, waitTime - remainder);
            }
            
        } catch (error) {
            console.log('DATA LOAD');
            console.log(error);
        }
    }

    load();

    function prepDonationURL() {

        if (currLang && Object.keys(langData).length) { 
            let phrase = encodeURI(langData.donationphrase.replace(/\s+/g, '+'));
            let currency = currLang == 'pt' ? 'BRL' : 'USD';
            let url = `https://www.paypal.com/donate/?business=S6B6QN3QR6B7S&no_recurring=0&item_name=${phrase}&currency_code=${currency}&&locale.x=${currLang}`;
            donateUrl = url;
        }
    }

    function getOSInfo() {
        let resp = { os: "", arch: "" };

        if (navigator.appVersion.indexOf("Win") != -1) {
            resp.os = "windows";
            resp.arch =
                navigator.appVersion.indexOf("x64") != -1 ? "x64" : "i32";
        }
        if (navigator.appVersion.indexOf("Mac") != -1) {
            resp.os = "macos";
        }
        if (navigator.appVersion.indexOf("X11") != -1) {
            resp.os = "unix";
        }
        if (navigator.appVersion.indexOf("Linux") != -1) {
            resp.os = "linux";
        }
        return resp.os ? resp : null;
    }

    async function setLang(lang) {
        currLang = lang;
        
        if (langList[lang]) {
            localStorage.setItem("currlang", currLang);
            menu = Object.entries(langList[lang].menu).map((e) => {
                return { id: e[0], lbl: e[1] };
            });            
            return langList[lang];
        } else {
            try {
                let resp = await fetch(`/langs/${lang}.json`);
                let json = await resp.json();

                localStorage.setItem("currlang", currLang);
                menu = Object.entries(json.menu).map((e) => {
                    return { id: e[0], lbl: e[1] };
                });
                langList[lang] = json;
                return json;
                                
            } catch (error) {
                console.log(error)
                return {};
            }

        }
    }

    async function handleLang(evt) {
        if (evt.detail) {
            let tmp = await setLang(evt.detail);
            langData = tmp;
        }
    }

    function closeMenu() {
        menuClosing = true;
        setTimeout(() => {
            menuActive = false;
            menuClosing = false;
        }, 550);
        
    }

    function handleSubmit(event) {
        event.preventDefault();

        //const myForm = event.target;
        const formData = new FormData(myForm);
        formMode = 1;

        fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(formData).toString()
        }).then(() => {
            formMode = 2;
            myForm.reset();
            setTimeout(() => formMode = 0, 4000);

        }).catch((error) => {
            formMode = 3;
            console.log(error);
            setTimeout(() => formMode = 0, 4000);
        });
    }

    function reset() {
        formMode = 0;
        myForm.reset();
    }

    
</script>






{#if ready}
    {#if !isMobile}
        <aside id="social" class:open={openSocial}>
            <div>
            </div>
            <div on:click={() => openSocial = !openSocial} class="share">
                <img alt="Social" in:fade={{duration: 300}} out:fade={{duration: 300}} src={ openSocial ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' fill='%23fff' %3E%3Cpath  d='M35.314 8.444 24 19.757 12.686 8.444a1 1 0 0 0-1.414 0l-2.828 2.828a1 1 0 0 0 0 1.414L19.757 24 8.444 35.314a1 1 0 0 0 0 1.414l2.828 2.828a1 1 0 0 0 1.414 0L24 28.243l11.314 11.313a1 1 0 0 0 1.414 0l2.828-2.828a1 1 0 0 0 0-1.414L28.243 24l11.313-11.314a1 1 0 0 0 0-1.414l-2.828-2.828a1 1 0 0 0-1.414 0Z'/%3E%3C/svg%3E" : "data:image/svg+xml,%3Csvg enable-background='new 0 0 458.624 458.624' version='1.1' viewBox='0 0 458.62 458.62' xml:space='preserve' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23fff' d='m339.59 314.53c-14.215 0-27.456 4.133-38.621 11.239l-112.68-78.67c1.809-6.315 2.798-12.976 2.798-19.871 0-6.896-0.989-13.557-2.798-19.871l109.64-76.547c11.764 8.356 26.133 13.286 41.662 13.286 39.79 0 72.047-32.257 72.047-72.047s-32.256-72.048-72.046-72.048-72.047 32.257-72.047 72.047c0 5.255 0.578 10.373 1.646 15.308l-112.42 78.491c-10.974-6.759-23.892-10.666-37.727-10.666-39.79 0-72.047 32.257-72.047 72.047s32.256 72.047 72.047 72.047c13.834 0 26.753-3.907 37.727-10.666l113.29 79.097c-1.629 6.017-2.514 12.34-2.514 18.872 0 39.79 32.257 72.047 72.047 72.047s72.047-32.257 72.047-72.047-32.257-72.048-72.047-72.048z'/%3E%3C/svg%3E"} />
            </div>        
            <div on:click={() => openSocial = false}><Facebook class="share-button" quote="{langData.seo.title}" url={seourl} /></div>
            <div on:click={() => openSocial = false}><Twitter class="share-button" text="{langData.seo.title}" url={seourl} hashtags="github,svelte" via="username" related="other,users" /></div>
            <div on:click={() => openSocial = false}><Reddit class="share-button" title="{langData.seo.title}" url={seourl} /></div>
            <div on:click={() => openSocial = false}><LinkedIn class="share-button" url={seourl} /></div>
            {#if isMobile}
                <div on:click={() => openSocial = false}><WhatsApp class="share-button" text="{langData.seo.title}. {seourl}" /></div>
            {/if}
            <div on:click={() => openSocial = false}><HackerNews class="share-button" title="{langData.seo.title}" url={seourl} /></div>
            <div on:click={() => openSocial = false}><Email subject="{langData.seo.title}" body="{langData.seo.desc}$${seourl}$$" /></div>
        </aside>
    {/if}
    <main id="home">
        <span class="back2top vanish">
            <a href="#home"><img src="/img/back.png" alt="" /></a>
        </span>
        <img src="/img/pandacub.png" class="panda" alt="Panda Cub" />
        <header id="home">
            <div class="nav">
                <div>
                    <img src="/img/logos/pandacub.png" class="logo" alt="Panda Cub Logo" />
                </div>
                <div class:mobimenu={menuActive} class:closing={menuClosing}>
                    <img id="logomobi" src="/img/logos/pandacub-small-dark.png" loading="lazy" alt="Logo" />
                    <img id="burger" alt="Menu" on:click={() => menuActive = true} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAXVBMVEUAAAD+/v7////////////+/v7+/v7////////s7Oz////s7Oz5+fn9/f3////s7Oz////29vb4+Pj5+fn////////////////////+/v7////+/v7x8fH+/v7///+aJC4IAAAAHnRSTlMABP3cwKRriTK9+qogFey3h2ZALNTJsa+XkW5MSAZL7rdqAAAAfElEQVRYw+3WRw6FMAwEUCe/80PvLfc/JkICJSwZFiA07wCzsOWRhWg19m9AamT1DTQg+LsAC/kxwAswhQVEqTgKIES3EyYvQJt7nWgBmp24CdDQEGO3xuYJqDJxFEuRaD6m+gEoh8PnfKVGOj0gjyzAe7ZVlnz264wQLSati3nyPtnJjAAAAABJRU5ErkJggg==" />
                    <nav class="menu">
                        <a href="" on:click|preventDefault={() => menuActive = false}>
                            <img alt="home" id="homelight" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAdVBMVEUAAAD////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////li2ZAAAAAJnRSTlMAMvjoPRLY5ArvBcqeeSDdlbFrK72DS0Qm0KfTtpBkYBvEinNXT+b708MAAAGRSURBVEjH7ZLbdqsgEIYHZHRAxWM87CTm0IT3f8TdMDatbUO9atfq6ncjMv8HzAL4vZjj0cAMeghC2DJNs4HH3Sm9kdnA8ipxzyTKb7JxnkjAI+hQcKY40Cohj9xMtFkh2MzXpfSfzH4liMondbnX3qtEWBAj53PEJza2VUCgKeFue7AWVMzRxwJtIr9o24Pa7ZRRrQwKuOd61UA/SrntYKhCgmodt2tw8qas0ez1Q6Ef/XxSE57nlN4fqU4+F8wl5kxHWN1PLndInf5MwLPkdoVRqXvD2BvRcu2McMfO7WYNHGK3IJ5gyHhYWpgZKl4jQ1NH7h26NlhyvRpeHzO3azO5TPM6A00FRxS9Pubiaprdhzy33pgu5tBEL4857UGd3ANOCvqUD5hDyttaWhz/QyN05OOOcElut4uYSxdA5oildi65AD1pzX9BZIl4SxKAuSoAkYTzfNPqaoBZJzA/I7T/PO1aQXbo6eRaQYFH/QnfLTTFV0KxFCjfxne2c02Mb+ZygqUxiDsNzXPNYu738B8Xu4vqsiMoQwAAAABJRU5ErkJggg==" />                           
                            <img alt="home" id="homedark" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAk1BMVEUAAABkZGRnZ2djY2P///+EhIQzMzNsbGz///9OTk5lZWVbW1tYWFg/Pz9ERERKSkpTU1NZWVlWVlampqb///+enp7///9ra2tBQUFVVVVubm5qamq1tbWysrKtra1ubm5cXFxXV1dsbGxubm5tbW1ra2v///////9paWlYWFhubm5bW1vExMS4uLiUlJT///8zMzO6FcGNAAAAMHRSTlMAgIz1MigVIBLx78cb/fr26NHjQAo3Bd/84ciWXFVJrHHe2K+lnisi5tnArY9jMht9x6N8AAABcUlEQVRIx+3S2W6DMBAF0MGt7QBmC4SSEsi+b/P/X1fJDKkjFcNTK0U9bxhfM2MGXld+v+dARloGFmKx8rzVQuiHq6etJpbjGWpMf+QTGw50kfMAtWAuhwREgg9H0R+YxGiIJ32B2kVtPEXNra0B4YSoJZxTZaFrCUifui3Ffi9YgaQrII+oRTOoDocqryJ7gLdlp6IMEcNSpK4t0J43Vpwq87madgdmIe2SfIlkepN+R0BtqMOz5EYdLpfnHwPtoZGjqhAN4Uw5VOqSG3+XSo1TMS/wSbEWaUzNTR7D7NJ+rqhkk6/4mApcCBrmtl1jjgxxKtc0vyz7HuZgq8xrN7lpfi2aTWsJp7Y7wSLsEDHR3voJPBpj6aOFL29NuR5s9AXo4bRJeNP6BmRCT3Z0ZiIB1JYJcLCXA4JtFZBBAfIngehDiwYHypFWDg4w0Nh/4LcDadAXCGowZZc3A72rPWPtksFzYv/+sMtobfe09jq+AIYXxKOQLstlAAAAAElFTkSuQmCC" />
                        </a>
                        {#each menu as m}
                            <a href="#{m.id}" on:click={() => menuActive = false}>{m.lbl}</a>
                        {/each}
                        <div class="animation start-0" />
                        <div class="dropdown">
                            <Minidropdown bind:value={currLang} setup={mddSetup} on:minidropdown={handleLang}></Minidropdown>
                        </div>
                        <img alt="Close" id="close" on:click={closeMenu} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAAIVBMVEUAAAAoKCgrKysmJiYzMzMqKiooKCgjIyMkJCQvLy8zMzMJXJBWAAAACnRSTlMAG/CBFOvRt5dNI+iQEgAAAQNJREFUSMfM1KFuQkEQheFW1RKamrraurqmqgqCxKJRKARvgEOjcEAg8D8lySZwMnvEsVw3e3e/e3d3Zl6e5nlfb/uhye+PgjGcB/X96wJWj2AGfNUJQ+B0X/QBcBgU4BtgKkCEADj9t+ANQIQAWLboE0CEANi36A8RFeDYwg0iKsBFgogGFGGHiApwbfEIERVgLhERw7LAR+p8IwwwogOc6AAnOsCJDnDCABEOGOGAEw6IcMAJB5wQ4IQBTgiIE/In4k/mbcaDykcdLytfd0yYnHIxaXPax8LJpReLN5Z/bCCxBeUmlttgbqS5FedmfhsLnuqAUIVCsEoiVKkRrBYHCwAAc/g48uebttwAAAAASUVORK5CYII=" />

                        <div class="menushare">
                            <div>
                                <div on:click={() => openSocial = false}><Facebook class="share-button" quote="{langData.seo.title}" url={seourl} /></div>
                                <div on:click={() => openSocial = false}><Twitter class="share-button" text="{langData.seo.title}" url={seourl} hashtags="github,svelte" via="username" related="other,users" /></div>
                                <div on:click={() => openSocial = false}><Reddit class="share-button" title="{langData.seo.title}" url={seourl} /></div>
                                <div on:click={() => openSocial = false}><LinkedIn class="share-button" url={seourl} /></div>                                
                            </div>
                            <div>
                                {#if isMobile}
                                    <div on:click={() => openSocial = false}><WhatsApp class="share-button" text="{langData.seo.title}. {seourl}" /></div>
                                {/if}
                                <div on:click={() => openSocial = false}><Telegram class="share-button" text={langData.seo.title} url={seourl} /></div>
                                <div on:click={() => openSocial = false}><HackerNews class="share-button" title="{langData.seo.title}" url={seourl} /></div>
                                <div on:click={() => openSocial = false}><Email subject="{langData.seo.title}" body="{langData.seo.desc}$${seourl}$$" /></div>                                   
                            </div>
                        </div>
                    </nav>
                </div>
            </div>
        </header>
        <section id="initial">
            <div id="screen" class:visible={showAfter}>
                <img src="/img/screens/{currLang}.png" class="screen" alt="Tela" />
            </div>
            <div>
                <div class="hero">
                    <div class="overtitle">{langData.overtitle}</div>
                    <h1 class="">{langData.title}</h1>
                    <p class="subtitle">
                        {langData.hero.first}<a href="https://tinypng.com/" target="_blank" rel="noopener">{langData.hero.link}</a >{langData.hero.last}
                    </p>
                </div>
                <ul class="features">
                    {#each langData.herocards as hc}
                        <li>
                            <div><img src="/img/{hc.img}" alt={hc.text} /></div>
                            <h6>{hc.text}</h6>
                        </li>
                    {/each}
                </ul>
                <div class="action">
                    <a href="#download" class="button"><span>{langData.download}</span></a>
                    <span>&nbsp;</span>
                    <a href="{donateUrl}" class="button" target="_blank"><span>{langData.donate}</span></a>
                </div>
            </div>
        </section>

        <section id="resources">
            <div>
                <ul>
                    <li>
                        <h2 class="strokeme">{langData.featurestitle}</h2>
                    </li>
                    {#each langData.featurelist as fl}
                        <li class="border">
                            <div>
                                <img src="/img/features/{fl.icon}.png" loading="lazy" alt={fl.title} />
                            </div>
                            <div>
                                <h5>{fl.title}</h5>
                                <p>{fl.text}</p>
                            </div>
                        </li>
                    {/each}
                </ul>
                <p>
                    {langData.featuresobs.first}<a
                        href="https://tinypng.com"
                        target="_blank"
                        rel="noopener">{langData.featuresobs.link}</a
                    >{langData.featuresobs.last}
                </p>
            </div>
        </section>

        <section id="downloads">
            <br />
            <h2 class="strokeme recuo" id="download">
                {langData.downloadstitle}
            </h2>
            <div class="subtitle">{langData.version}&nbsp;{data.appversion}{data.appversion[0] == '0' ? ' Beta' : ''}</div>
            <div>
                <div>
                    {#each downloads as v}
                        <div class="os" class:sel={v.actual}>
                            <h5>{v.os}</h5>
                            <div>
                                <img src="/img/{v.id}.png" loading="lazy" alt={downloads.os} />
                            </div>
                            <div class="links">
                                {#each v.list as link}
                                    <a
                                        href={link.url}
                                        class:sel={link.actual}
                                        download="pandacub-{v.id}-{v.arch}-{v.version}"
                                        >{link.desc}</a
                                    >
                                {:else}
                                    <span>{langData.soon}</span>
                                {/each}
                            </div>
                        </div>
                    {/each}
                </div>
                <div>
                    <img src="/img/pandacub-sit.png" loading="lazy" alt="Sitting panda cub" />
                </div>
            </div>
        </section>

        <section id="donate">
            <h2 class="strokeme">{langData.donationtitle}</h2>
            <div>
                <div>
                    <img src="/img/panda-coin.png" loading="lazy" alt="Panda cub with coin" />
                </div>
                <div>
                    <p>{@html langData.donationtext1}</p>

                    <p>{@html langData.donationtext2}</p>

                    <p>
                        <img src="/img/qrcode.png" loading="lazy" alt="QR Code" />
                    </p>
                    <br />
                    <p>
                        <a
                            href="{donateUrl}"
                            class="button" text="{langData.donatebtn}" target="_blank"><span>{langData.donatebtn}</span></a
                        >
                    </p>
                </div>
            </div>
        </section>

        <section id="contact">
            <div>
                <h2 class="strokeme" id="contactlink">
                    {langData.contacttitle}
                </h2>

                <form method="POST" name="contact" bind:this={myForm} data-netlify="true" on:submit={handleSubmit}>
                    <p class="just">
                        {langData.contacttext.first}<a
                            href="mailto:ola@pandacub.app"
                            >{langData.contacttext.link}</a
                        >{langData.contacttext.last}
                    </p>
                    <div>
                        <input type="text" name="name" placeholder={langData.placeholders.name} required />
                    </div>
                    <div>
                        <input type="email" name="email" placeholder="Email" required />
                    </div>                    
                    <div>
                        <input type="text" name="subject" placeholder={langData.placeholders.subject} />
                    </div>
                    <div>
                        <textarea name="text" placeholder={langData.placeholders.text} required />
                    </div>
                    <br>
                    
                    {#if formMode == 0}
                        <button class="button" type="submit"><span>{langData.sendmailbtn}</span></button>
                    {:else if formMode == 1}
                        <div class="formwait anim">
                            <img alt="meditation" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALAAAADACAMAAACTSxmtAAABelBMVEUAAAAAgDMAgDMAgDMAgDP///8AO0f9/f0HO0X8/vv6/fwEO0kBREMHhj8EOkMvWWAbSFD0+PgRQUoEgz0Hg0PU6t4CREUPikgMPUi1w8aesbSEnKBSdHo8YWkIgEUHa0iTqawpU1oXRE4hTFUpmmcCX0Du9PQ4XWWltrlAZ23I1NVqh4tmg4hYeX9IbXIlT1gMiER4vphIp3oQiFb2+/jr8PDQ2tzAzc6qu711j5Tc5Oa6yMp4kpdyupNhgIZffYILc007onLT3uCQo6dNqn4GdEPh6OnX4OHY6t/M19pxjZJpt45tiY6ZrrGJn6N/mp1EpncPelAUjEwESEgHekUFZkXW696uv8FtuJIgk1YQglTQ6d19lZpjs4tVrYJGaW8ynm0Nd1AFY0Pl7OyKpKdfsYdOcHYKTVIYj1EGS0oAXD0vnWsPfVMJb0vH59tasIYil2Iek14pl10FQE2y3dW+3tKg1sx9vphllIckhH5VhXoNWVghhFUEgTbn8G4GAAAABHRSTlMAWxxxEg+7PAAADspJREFUeNrsmmlX00AUhk1I5s5MSTe6AipgZSkqtFYqRUBAQUAUdwVBcUGPu37Rny+lLU3mjnaSjkrP8fH4iSxPL+/cWcqJ/3QUpiHBPHEcqalOWhKc3DHTPnR1kCfSPh7WB7Z3LWXS/1jaRJVVoEvR+XjY1p3/vrKJBpg/HIUya9Xtstom/deUTTTMAuJIlfXrpq0DOkW5rtspyii7Opj8c8om0tXBH+tyJmq7GpUPjDulvDXShtk55a3RZXZOeatoLbIpnYb102V2Tnkbxp3lexALs7N8dUx8Ztr6m7QdC7NlNztWxkrd9xgZK8b32Bj/0jexdWdv78PFHp8e+BFbPcrGwX0TV892k0NSp08Fs+3ZazyiGz8iuLEhfdfHbtKk+0HCEnFyuecLC5vFYvHateLmwvMcGgb3U+5HnD0lN9bTHxL3KPHQfd9qkt78PFtIMsYZgF0DGEsWXm+mXY94kRIecV1urMP3VIqIpOqvcxY+F5JVU6hqQsMYqv8AkoXdu42PTAT0GJtpmW89DrjG6d3thqMcgBuzm07NV9HYaHvA9XQTGd1bufUkspU5b1/7+oYQ+YfGOGa7DeJ0iEig5xcZt1sDYAMvjU5QqXHCwqTN9hpEQlrgyAxnYCsDw1cyBENPtxVj05EWmIiESGZ6mNm+AMhHQgSRSrRhbN6VduAU0iVnZlB2VYo8TnGJ71gyjDZmuC1c4LFlbgcAeC+OxQPLChpjw5Kyh4oyHrODAawcJQLvAq8qzElLykexvn3cDgwsDop9oseSYgQLBB5zdIDbbQCVCPU+76IlZdIMEggsTDe43RZsOYKE1UOBOwTmqjsOdADsNoHKYMjd1+qRwBhKBcZ8IE3CTzmz2wWm3CPvrIVAJfa350wc9WFK5ku2BqCcCeGpDmME3MSdPQrEyWGwdQC99CgRaBmPmrFqIHCIoxVmawHYOEqEDMNPgfHcTLNgawJiI3h9iXFMlQJj7teWa9PM1gXAVBwXGGOoFhi34hCNxMDWaLxE0XJYucRGy+35G0IyeVsrpZN4xGEMNWFs/CC1xvQKw1QG+com6KDnfncuaRZm8APnAWOoFRhTBNBcYXvWUuCuqbKsxDhJWzfw8JuKsRGswLvM1g775AQRNruUCgy2flhR5dVmkAJf49JeCoxzOOB3SWVQvURLidWFnW3ZK4Hnnz6bmDh/+TczClu8MnImMjcqXTUx2LRa02X6T0SRS3TZzBglVcKRMpfWEGD4Zu2SULTvEgB+hFKjMPwnoiCReTlHSQN6i9sSYzbV3L+FB7MMX/Lw7R8RfvIQ++YHhZ0/LqCwp6dXSrjG60qZ8Cu8w9Hv8lGceAhPcxB9V6PEA+1HSYYbkz5LbDpBehqMUiJAe5mYmUEi8gwbF5WF1Qu8gIZcNoNcQvEV2wOfJyKU9sfwsNMvvAMg5DdOJPR7QzETJhh6U8yxSibSJjqN8LOMgEsRIoPmwd2jn8lPwXsFYaVWbPgq8HMxdnNEzrjbZYU20+JWH1rxGvN17cK74HkBPHL135O3l84NkTqDrqzDAK3b0rHbS3Px0JH9BWFEJB3dwrPekgw3B398lHNgy41fPnWNKLbWuOYyB+CVMdKAjgoj4n1rhRwSVo8w3KLNc0GAw0wPYmGoC4d7OUC1x02QBhMxbyaKflZsOYUIc2+Bo+43H8qwgVqJIwyf7USqvgDAlkgD8Txxx0eITcfvwgcGyBFj2ToDWAQu1T7YhWydV5Q0s+4xLigJq0f4tacL84h7HjiQOPxfm3hLnoVaNt6IdhXigmbB96gLOubYKiVy4n0xYQ7Lj1AiZ97dToDn9Ap/B7fGbYIJE0L3FxmI25HY0hCREo15rlxQaBNBmwQfIxJCkSwH6bcD56h8TrTdKLSJL+rCX5i7GKU4QdChVzGQ7zg4y5+UKW94rt5V72sK6cm5VaASxr79y0jW7bwhycWa547X6m3ii9WS957alSkabAOuNGDAhpWREFrYeW7xsZr4qrL0cT88i8ZPmUGLc1U23E8E9j33PFYWNh0FYU8kZkTfPLdbEzsvCjPfwspd7b3tFhbacLzMQUGYxS4QD3MoEvqEc+4jBxjOEBd0FOkCq6YAKQtr/j6QLib0C9t8RHgvoMiCLNRQOUOa0DJqa/qEnaRbmPW5vsWdxrt/WNyYXrs1E8OVzw8174x6f17UKmwV3MLQ3PmEznF07rd6gYaqFYwulQCdqjSN19x3AizoFV73RBLmG2uw6ZIQVmAzRzshOl9CWTk6B4pXmOcHOX3C+KQVlqON+YIJAYaYK6fhDXxytTJSq/8SgNs36WgUxjsOthqhlO5PSfrZI88hD27QEOuLEkr7hFvXLb3CzrawOIiVsxUu6wW97il4RNYr4OBe8e+beFGzsLWj/Oc8FB1SKJBMW21NzZi3N2w1+HjTOLqsKMzQxOx38YMpcFD8in6N1pRpZBUU70k+8SOcs1R4cgMUQ8FXxyPxTHS/NwaqOZq1/AgblhI/2znz56SBKABHR3bfbjAJAWqEIJctIJe1FsFiqVrv2nrXo+p438d4zXj97yZAU3ETNwmL4w/9xmNkYvLx+nazu9mXm/43bmCy3jiMLSL+OPt8EsJX7vgWwLjdIBHfkHf+DHbvdIR98eEs9S9c8S2MMfOgLtysmeV4kndt+1efcoY4H3Ggd5guLeS6BMsFwjOeJ8RWxCmV4MEHPGOSdBJYvPDuz5Tz0z1TO0pszQy0ScReRTnJS3xOj8ZZDOQa30xyjFullYUTZbW0qlcXFtIqb08pYXw5wkyIeVzitDwSe5zR1PTM4QM9NXP+DMcX3+HkA1eYz6sbmNfqKSER3P8LY07/wLQ3zmMkVpjPrSQlgjajPOEnI/8ZB5+DF3hBFjiAYIXZ/T58PtzBY+uevcuGly/shDggy2S8rCDJY2xr49+YwwvPjuOLafICkw0inzWzXDkb3tbK3SehXrKyI3z18qnPOHzPYJep9bn1g9kTyBEOG+JT32hQTTwYBiWPHRqGZs/y7I3WiyDGe3aGFT4VbeGAthQTcnb2yfGDw37x0s0kxpg2ghjvYDYy+vat0CDCli5NHrt3fBja3a+Wj93Ag5FcGxhjnjAbYr6vkvqrL43FKMaY2NDk3M13h47v3+3IWqHt37aHi0Ty1YTvjAglHM9GUWGG02nNzM7O3rz7btmqEX7/c7N4+Pjy3dnkH2ML0kFwdV+AAAfuJxLPmIVzFwihFrG3nz59+XJo+d6TC/3iYWwxmH+MLuVPXfMrHDzE++yaWVjAEVFQlSm65WQEIxy3Su4T1m/vMoNijIjyxYOV8ehDJpEHKpZHfKiyw73GYN/1qBydnoLo9GXGOXE9imxWSEQc/YU417RIZKfAdolOLyUG4wg2xPump5DDH40hvhSVEXIyQhREdar8mcbtMLU057pp/3K0/0jetTxo3wtwnsHjiEA20JDom8RIAcYIzyQXapv/8+HUH9XR8cvTW9+3hyMiOQBbEco6ytdhqLJ5XU1iGRwjT51yavBfxC3Z25ezIwXC5YhQDmtoCytfb8/FnSKiqKWyGSqTDTD0j1myG9trGJ7g5csoGgUeiRUmPTSC/NtFrw+7UhtghDPIZlCHN4c8KVHBwilAXiw5JfaewvB6tOiapSu6tOe0grwYVjG+dBdeRDaXR2uYWfZiwcI4j0ZgClvjHhEug51A9nDPaXQuwLxw4RryJLtVKZmRGIqDb3V9Kev4sthrkmLBF2XvED9cejPoJuQUK9xWEJ8qJRHBnJARn/uSCxnExd6oLJqYBoiH7OabAh/CrYhwSAPxKUks9xEf/bB4YdxBfEBiaSI+GTy4xpBxNPFIcQUXiUWVEZcaoY8Wct3FumnWV9KpI/M0sDbG9PSRVLpTrVW76YsLpylpKeGEu4hPbyXvhMP+foZabc8THMC2ddIsAiAHyFfXDcRFk1xQERdZZj4B3WwzFUjuFXX4aFoF+wyjZwE/vZPkxiIKh6KdP0c5ccYk1m4AoFDkJQ8AhUSGilP/5wo9uqH9PVU/Im+6tlyAW0f04a65Z4gDNHMz2KMAkLZ63Fh8nNuVjXL6NJaCzBxsz1ptXz5yMxVzFT66CIiLYhnHX1uzdtZ3RfLGNBSQR4Lbn4pmAfkBMgcoZjb4rOqyr7SyZ2S7Em9GwgyKks9JHJrO0YNpoTPe5APGxkiQccTZtM8Hss6Ud7M7gseSH4z+0crVB/HhrPmq/9aH1HPk98eiaQP5Jrpvc1HhO+oryKbkD1ODQiO3g3nrky+Mk06Q8ZmKjAIwvbU7v5o3dPVxyPdITqNAQOMoxoOXaDGNmBtitkw8uHFiCgVEa1MaIY/qgAKSZd4mEcZ4CQJGWK8fIJgeaaLARON8X77xQxQINX2UUBJbM1AI5piV4BDGL/3HtvB0tUUJIXTdHuUEB26P/VrqnTue81LYNgPIm93yicMUU0pnLpYAhQK+inhVufK3WIGil3rpdivW3+mKCZ1fXyyg0KxJAgDv2EJ+1VKllifGmMbOtDsVA41DSoSwd2uHtRju686cWF+tZQoKoPEASQR1z9OXCcHz62umqoNs5/LYKEKEcx4m8hrFj1Z0QOLIS0IAj7PH6IEiEkpHjLDpHuBVeqLwxwzyv0hhC8P17OdoRkYikWuihDtuYsZ8G2ShvkVJGCUXM33GVNB/mRA2GmKAM0WxvhuSSHT2AjldqG9dEovO3BjUAhJITxJNnhmkCQTWJPFUDTQpVGkyqIAmgdGVJkW6IF4ZGtIk6eqCde9Lk+ZkSVEEySpaTfonpGqqARCgp2BX8QGKZlr6t6TSK/VGJl8s6NBHUZTBnwpsoQwBG0PXmmrFrHVz0jbbbLPNNttsI5TU43Sn1jMrlVK+qBV0Ayyce/LIDdr5UC9oWlHNVBr1xZWN1VxZmjzldK2hagAgarSm6M1MvTOhkUW9AIozQBOJLAOoE4h3ymzasZUn4KtnzkuTItddbJSaBWO8vOintq6pFXvnkPTvKF98vNY9X+vVzaeVTEa1aBaLRe13rH+rFiWrrZn1+mK1s5HOpcrSNv8vvwCXYu/obYlQZQAAAABJRU5ErkJggg==" />
                            <span>{langData.formwait}</span>
                        </div>
                    {:else if formMode == 2}
                        <div class="formwait" on:click={() => formMode = 0}>
                            <img alt="ok" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAxlBMVEUAAAAyunwqtXkyunwyunwyunwyunwos3grtnoyunwyunwyunwyunwyunwyunwyunwyunwyunwyunwLoW4Mom4MoW8Nom8LoW4LoW4yunwNom8grHkNo28Oo28Oo28QpG8Oom8yunwKoG7///8NonAqtXk1u373/fpjy5u05s9dyZi76NSm3cv0+/jw+va149Or382b3cFqzqBVxpNCwIfa8+iv4NC/6te459Ky4dIVp3LP7+A2tIY7vYKM2LZlw6RYv5tBtY8Dxft0AAAAIXRSTlMA9BCuhdqPJQfkzVUb7MZ1al069d2zkuzNt4n6eGxhPlhVO3rrAAACGklEQVRYw52X53raMBhGJcvgsIdZIauSABPa0BKa0pJ03f9NBTL8woct68v5f87joSnyqNdCVa1IrWWlqsJaXbDolkuaUCp3fe2gBfu40Qp89FDqXGRYmGg3tJNG26lHTV1IM8r3O1J7IDt5fll7Us7Uz5T2Rp1l+OeawflpQWkWyv3+/O/Q0Ww6h34kNRsZCdDUH6AJv+3r/F5/1yAd1UHDT5+tEms3SDTeZ1bo6d/aPQ8ohG8PIL19UpCvj9Bi+KTQegmUPH2wSdeovd/19sGTfqOLQczx7f/twYAu8X17YbbpO9Q9/J/EXxljtlO9py5q+oj7zePtusD/OjE7Ji+FGhlFK7sjuS/000IoFPFpYfaZ+L92PgpKVImPgsNHoSoq8P9Yi4LLB9OKkJiriQXJPNP/8eqDC6FTFnYPCi4fHATWlhRcPgIShQdSePTw48OPuF5aF9/ggyF+IwoM34yOB9JiyfRNH0MZBYZvxnQyLe5YvvmE6ewqfIFPiLCgoMDwe1jSSMHpg0Hmojq/K/DBTfayPk88/R42ltMC1p98LrG1nRR8/DjA5npagJ/L2LW9z5d4/xyGgfOAMfv398k4uSo44kwnbn9EDlncQhyRYx63cE0OmtzCQBAUr9DPOGxzCv2s4zrjGeB/7DsMeFceWoiveZcuWhhFrGsfLQyvWBdPWojHAf/qi0LvMmBfvlHoDW58TP71/xmh+aefbOvLQAAAAABJRU5ErkJggg==" />
                            <span>{langData.formok}</span>
                        </div>
                    {:else if formMode == 3}
                        <div class="formwait hand" on:click={() => formMode = 0}>
                            <img alt="err" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAA8FBMVEUAAADxUknoSUHxUknxUknxUknxUknxUknpSULxUknxUknxUknxUknxUknxUknxUknxUknxUknxUkmvEA+zExK1FRS2FxW3FxazExLxUkmwERC0FBO1FhW5Ghi7GxrEJCG9HRvSMy3fQDnTNC/xUkmtDg7////W1tawExP5tbHiQzzYOTPyV07y8vL80M7yYlr95uSzJSXzZV3+9/fpvb3enJzLnJzIjY3HiIj7y8nRvLzgo6PLoKD4pJ/zcWm7OTn23t71xcPnubnmtbXNpqbqW1S2Ly/V0NDiqanUgID1g3zCcnLzcGjEUlLgUEq5RkZeS/FbAAAAJHRSTlMA9BDaro+F5AfszcZ1al1VOiYb9NuRhnDDt+2vrl5WOycczc18uB89AAACV0lEQVRYw52X2XLTMBRAJddLYydxmr17C9dKCyFdUihQ2rRAyw7//zcY0UG+V5YscR49c85IjqOFmejncZgmHIAnaRjnfeZFL1oDwlrUc7WDtrJxox246DEHIzxuTHRaYKXVseobGTSSbZj9LgcHeNfkR+BIVKuvh+BMuF7jb4IHm3ohBC9C+/z930MXvOmi35/7B3j1e8jgP8iU3wHC96/nQJjfnADh31cdkO//ZCGEuJujZ9dLIRYk0QoeAzEgzk/FHxbVwrF8dErGFT8OgGu+KihfFvAY+N8htPH4S18VkF9yew9V2jKA159y/qggfcXdM7RGyfUPD0BUeTPHfskKFXraR3wjSIH44sdRtRBpM5gvSYH44qGQBTWHPmCuhZXPRYEKfZYD4djmXxwVuJCzGLSC3ceFmIVgL1CfFEKWgnPhfenTQsoSsBaoTwsJ4+BY+CB9WuAMwF6gPi24Bl68UgFUYNzNn83qC5wljr6hkLDUzTcVnrDQzZe80ws7LHbxzYUxyx18S2FP/ztrPuKSBA6bFpSryxnmDPnDpiXtqihI4RcKjPRFlfq08IAC+/Zl/WUheV3xP+IZGDYW5dPCW/wKJoatTfm4QP1BULu53t8qHxWoX4wN2/vPCyGWXwrEt0/l/Im/FZgOGM/PVvrysVI6egOSjBYKB6bokOVfGBzgY553YZchIt/CiBFCv8K24bDtWpjWHdc9xrCNfP/3MDJfeVwKg13bpau5MD3wuvbRwtbE6+JJC4Nx4HP1pYXhJPC4fNPCcLRvEezX/6c7471DZuA34aDQlgz3i7oAAAAASUVORK5CYII=" />
                            <span>{langData.formerror}</span>
                        </div>
                    {/if}
                </form>

                <div class="grass"></div>
                <div class="pandabamboo"><img src="/img/panda-bamboo.png" loading="lazy" alt="panda"></div>
                <div class="syn">
                    <span>{langData.syn.first}<b>&#10084;</b>{langData.syn.second}
                        <a href="https://synergys.component_subscribe.br" alt="Website Synergys" target="_blank" rel="noopener">
                            <img src="data:image/svg+xml,%3Csvg height='30px' style='cursor: pointer; pointer-events: all;' version='1.1' viewBox='0 0 116.50067 14.90286' xmlns='http://www.w3.org/2000/svg' xmlns:cc='http://creativecommons.org/ns%23' xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns%23' xmlns:xlink='http://www.w3.org/1999/xlink'%3E' + %3Cg transform='translate(157.29 -32.162)'%3E%3Cg fill-rule='evenodd'%3E%3Ccircle cx='-149.84' cy='39.556' r='6.9285' fill='%23fff' style='paint-order:markers fill stroke'%3E%3C/circle%3E%3Cpath d='m-149.84 32.162a7.4514 7.4514 0 0 0 -7.4514 7.4514 7.4514 7.4514 0 0 0 7.4514 7.4514 7.4514 7.4514 0 0 0 7.4514 -7.4514 7.4514 7.4514 0 0 0 -7.4514 -7.4514zm4.6384 2.8893c0.0426-0.0012 0.0645 0.0018 0.0609 0.0098-4e-3 0.0083-0.40137 0.15865-0.88352 0.33419-2.1841 0.7952-3.6774 1.5659-4.7286 2.4404-0.77618 0.64573-1.0705 1.1163-1.0472 1.6742 0.0199 0.47428 0.21819 0.72668 0.71751 0.91307 0.39773 0.14847 1.0508 0.22298 1.5716 0.1793 0.18353-0.0154 0.3398-0.01156 0.34726 0.0085 0.0201 0.05416-0.50225 0.40685-0.86819 0.58619-1.9102 0.93609-4.0136 0.15267-4.0555-1.5104 0.0176-0.87834 0.76752-1.6787 1.3293-2.1326 1.1081-0.88679 2.9103-1.6246 5.1893-2.1245 0.75245-0.16504 2.069-0.37113 2.3672-0.3782zm-2.438 3.2665c0.60369-0.0012 1.1756 0.15052 1.6217 0.44804 0.41738 0.27839 0.62462 0.51811 0.79032 0.91414 0.25262 0.71654 0.0937 1.2655-0.21675 1.7236-1.048 1.5424-4.2193 2.6188-8.1161 2.7547-0.75625 0.02641-1.0324 0.02331-1.0165-0.01144 5e-3 -0.01047 0.22602-0.06495 0.49152-0.12102 1.2863-0.27164 2.9426-0.7905 3.9269-1.2302 2.2269-0.9948 3.1354-2.003 2.627-2.9153-0.21789-0.39095-1.0218-0.70574-1.9423-0.76052-0.246-0.01461-0.45271-0.0412-0.45932-0.05903-0.0201-0.05404 0.60478-0.36812 1.0399-0.52279 0.41266-0.14666 0.84058-0.21924 1.2536-0.22014z' fill='%232ebff4' style='paint-order:markers fill stroke'/%3E%3C/g%3E%3Cg fill='%23fff'%3E%3Cpath d='m-137.49 43.561q-0.27844 0-0.27844-0.31256v-0.74087q0-0.31256 0.27844-0.31256h6.0078l-5.044-2.5583q-0.40694-0.20837-0.66396-0.42832-0.25702-0.23152-0.40695-0.47462-0.13921-0.25468-0.19276-0.5325-0.0428-0.27783-0.0428-0.59038 0-0.38201 0.12851-0.7293 0.12851-0.35886 0.38553-0.62511 0.26773-0.27783 0.65326-0.42832 0.39623-0.16207 0.91026-0.16207h7.8819q0.28915 0 0.28915 0.30098v0.74087q0 0.31256-0.28915 0.31256h-5.8043l5.0333 2.5583q0.41766 0.20837 0.66396 0.4399 0.25702 0.21995 0.39625 0.47462 0.14992 0.2431 0.19275 0.5325 0.0536 0.27783 0.0536 0.59038 0 0.38201-0.12851 0.74087-0.12851 0.34729-0.39623 0.62511-0.25702 0.26625-0.64255 0.42832-0.38552 0.15049-0.89956 0.15049z'/%3E%3Cpath d='m-122.79 43.561q-0.27843 0-0.27843-0.31256v-2.7551l-3.8446-4.4337q-0.0964-0.10418-0.0964-0.20837 0-0.09261 0.0643-0.13891 0.0643-0.04631 0.14992-0.04631h4.3158q0.28915 0 0.48191 0.23152l2.8486 3.3802 2.9664-3.3918q0.11781-0.12734 0.21419-0.17364 0.0964-0.04631 0.25702-0.04631h0.62112q0.10709 0 0.14993 0.05788 0.0536 0.04631 0.0536 0.11576 0 0.09261-0.0536 0.15049l-3.8767 4.4337v2.8246q0 0.31256-0.28915 0.31256z'/%3E%3Cpath d='m-102.67 43.561q-0.32127 0-0.56758-0.04631-0.2356-0.04631-0.589-0.18522l-8.5351-3.4497v3.3687q0 0.31256-0.28914 0.31256h-1.3815q-0.28914 0-0.28914-0.31256v-7.2814q0-0.30098 0.28914-0.30098h1.3172q0.17134 0 0.31057 0.01157 0.13921 0 0.26772 0.02315t0.25702 0.06946q0.13921 0.04631 0.31056 0.11576l7.9676 3.3224v-3.2413q0-0.30098 0.28915-0.30098h1.3815q0.28914 0 0.28914 0.30098v7.2814q0 0.31256-0.28914 0.31256z'/%3E%3Cpath d='m-94.932 39.937q-0.28914 0-0.28914-0.30098v-0.75245q0-0.30098 0.28914-0.30098h5.1189q0.27844 0 0.27844 0.20837v0.93767q0 0.20837-0.27844 0.20837zm-2.2917 3.6233q-0.76034 0-1.4029-0.2894-0.64255-0.30098-1.1138-0.82191-0.4712-0.5325-0.73892-1.2502-0.25702-0.7293-0.25702-1.5859 0-0.84506 0.24631-1.5628 0.25702-0.7293 0.71752-1.2618 0.46049-0.5325 1.103-0.82191 0.65325-0.30098 1.4457-0.30098h7.4856q0.28914 0 0.28914 0.30098v0.74087q0 0.31256-0.28914 0.31256h-4.9797q-0.3534 0-0.59971 0.08103-0.2356 0.08103-0.38553 0.2894t-0.21418 0.55566q-0.06425 0.34728-0.06425 0.87979v1.2618q0 0.59038 0.07497 0.99555 0.07496 0.40517 0.22489 0.64826 0.16064 0.2431 0.39624 0.35886 0.2356 0.10418 0.56758 0.10418h5.0118q0.28915 0 0.28915 0.31256v0.74087q0 0.31256-0.28915 0.31256z'/%3E%3Cpath d='m-79.438 43.561q-0.42836 0-0.7068-0.31256l-3.2234-3.577q-0.08567-0.0926-0.13922-0.17364-0.04284-0.09261-0.04284-0.25468v-0.35886q0-0.30098 0.27844-0.30098h1.4671q0.51404 0 0.76034-0.20837 0.25702-0.20837 0.25702-0.57881 0-0.7756-1.0174-0.7756h-2.3881v6.228q0 0.31256-0.28914 0.31256h-3.6732q-0.28914 0-0.28914-0.31256v-7.2814q0-0.30098 0.28914-0.30098h9.3597q0.48191 0 0.89956 0.15049 0.41765 0.13891 0.71751 0.40517 0.31056 0.26625 0.48191 0.63669t0.17135 0.82191q0 0.4862-0.17135 0.87979-0.16064 0.38201-0.44978 0.65984-0.27844 0.27783-0.66396 0.45147-0.37482 0.17364-0.80318 0.2431l2.9557 3.2761q0.07496 0.06946 0.07496 0.18522 0 0.06946-0.05354 0.12734-0.04284 0.05788-0.13922 0.05788z'/%3E%3Cpath d='m-72.125 43.561q-0.76034 0-1.4029-0.2894-0.64254-0.30098-1.1137-0.82191-0.4712-0.5325-0.73892-1.2502-0.25702-0.7293-0.25702-1.5859 0-0.84506 0.24631-1.5628 0.25702-0.7293 0.71751-1.2618t1.103-0.82191q0.65325-0.30098 1.4457-0.30098h7.4642q0.28914 0 0.28914 0.30098v0.74087q0 0.31256-0.28914 0.31256h-4.9583q-0.3534 0-0.59971 0.08103-0.2356 0.08103-0.38553 0.2894t-0.21418 0.55566q-0.06425 0.34728-0.06425 0.87979v1.2618q0 0.59038 0.07496 0.99555t0.22489 0.64826q0.16064 0.2431 0.39624 0.35886 0.2356 0.10418 0.56758 0.10418h1.8955v-3.5423q0-0.31256 0.27844-0.31256h3.0628q0.28914 0 0.28914 0.31256v4.5957q0 0.31256-0.28914 0.31256z'/%3E%3Cpath d='m-59.222 43.561q-0.27844 0-0.27844-0.31256v-2.7551l-3.8446-4.4337q-0.09638-0.10418-0.09638-0.20837 0-0.09261 0.06426-0.13891 0.06426-0.04631 0.14993-0.04631h4.3158q0.28914 0 0.48191 0.23152l2.8486 3.3802 2.9664-3.3918q0.1178-0.12734 0.21418-0.17364 0.09638-0.04631 0.25702-0.04631h0.62113q0.10709 0 0.14993 0.05788 0.05354 0.04631 0.05354 0.11576 0 0.09261-0.05354 0.15049l-3.8767 4.4337v2.8246q0 0.31256-0.28914 0.31256z'/%3E%3Cpath d='m-50.939 43.561q-0.27844 0-0.27844-0.31256v-0.74087q0-0.31256 0.27844-0.31256h6.0078l-5.044-2.5583q-0.40694-0.20837-0.66396-0.42832-0.25702-0.23152-0.40694-0.47462-0.13922-0.25468-0.19276-0.5325-0.04284-0.27783-0.04284-0.59038 0-0.38201 0.12851-0.7293 0.12851-0.35886 0.38553-0.62511 0.26773-0.27783 0.65325-0.42832 0.39624-0.16207 0.91027-0.16207h7.8819q0.28914 0 0.28914 0.30098v0.74087q0 0.31256-0.28914 0.31256h-5.8043l5.0333 2.5583q0.41765 0.20837 0.66396 0.4399 0.25702 0.21995 0.39624 0.47462 0.14993 0.2431 0.19276 0.5325 0.05354 0.27783 0.05354 0.59038 0 0.38201-0.12851 0.74087-0.12851 0.34729-0.39624 0.62511-0.25702 0.26625-0.64254 0.42832-0.38553 0.15049-0.89956 0.15049z'/%3E' +%0A%3C/g%3E%3C/g%3E%3C/svg%3E" alt="Logo Synergys"/>
                        </a>
                    </span>
                </div>
            </div>
        </section>
    </main>
{:else}
    <div class="wait">
        <aside class="startscreen">
            <img alt="meditation" src="data:image/png;base64,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" />
            <p>{langData.wait || ''}</p>
        </aside>
    </div>
{/if}

<style>
    .formwait {
        display: flex;
        justify-content: center;
        gap: 15px;
    }
    .formwait img {
        height: 40px;
    }

    .formwait.anim img {
        height: 64px;
    }
    .formwait.anim img {
        animation: simplefloat 3s ease-in-out infinite;
        animation-fill-mode: both;
    }

    .formwait span {
        display: block;
        line-height: 34px;
        font-size: 28px;
    }    

    .formwait.anim span {
        line-height: 48px;
    }

    .menushare {
        margin-top: 32px;
    }

    .menushare > div {
        display: flex;
    }

    #social {
        position: fixed;
        z-index: 1000;
        top: 32%;
        right: 0;
        padding: 0;
        margin: 0;
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
        overflow: hidden;
        font-size: 18px;
        transition: all 0.4s ease;
        cursor: pointer;
    }

    #social > div {
        transition: all 0.4s ease;
    }

    #social > div:first-child {
        background-color: #666;
        position: absolute;
        text-align: center;
        padding: 0.75em;
        border-bottom-left-radius: 5px;
    }

    #social > div.share {
        background-color: #666;
        position: absolute;
        text-align: center;
        padding: 10px;  
        left: 0 !important;     
        box-sizing: border-box; 
        border-bottom-left-radius: 5px;
        transition: background-color 0.4s ease;
    }

    #social > div.share:hover {
        background-color: #222;
    }

    #social.open > div.share {
        border-bottom-left-radius: 0;
    }

    #social > div.share > img {
        object-fit: contain;
    }     

    #social > div:first-child > img {
        width: 60%;
        height: 60%;
    }    

    #social > div:not(:first-child) {
        position: relative;
        left: -100%;
    }

    #social.open > div:not(:first-child) {
        left: 0;
    }


    .vanish {
        opacity: 0;
        pointer-events: none;
    }

    .dropdown {
        width: 28px;
        height: 28px;
        display: inline-block;
        transform: translateY(5px);
        margin-left: 8px;
        border: 2px solid #f2f2f2;
        border-radius: 50%;
    }
    .action {
        margin-top: 4vw;
        text-align: center;
    }

    .pandabamboo {
        position: absolute;
        bottom: 70px;
        left: 20px;
        height: max(18vw, 230px);
    }

    .pandabamboo > img {
        object-fit: contain;
        height: 100%;
    }

    .grass {
        background-image: url(/img/grass.svg);
        height: 40px;
        width: 100%;
        position: absolute;
        left: 0;
        bottom: 68px;
        z-index: 2;
    }

    #burger, #close, #logomobi {
        display: none;
    }

    #homelight {
        display: inline-block;
    }

    #homedark {
        display: none;
    }

    .lang {
        height: 24px;
        border: 2px solid #fff;
        border-radius: 50%;
        vertical-align: middle;
    }

    aside.startscreen {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background-color: #f2f2f2;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 3em;
        text-transform: uppercase;
    }
    aside.startscreen img {
        animation: simplefloat 4s ease-in-out infinite;
        animation-fill-mode: both;
    }

    aside.startscreen > p {
        margin: 0;
    }

    .back2top {
        position: fixed;
        bottom: 10px;
        right: 10px; /* 0 15vw; */
        width: 48px;
        height: 48px;
        z-index: 11;
        transition: opacity 0.5s ease;
    }

    .back2top > a {
        width: 100%;
        height: 100%;
        opacity: 0.5;
        transition: opacity 0.4s ease;
    }
    .back2top > a:hover {
        opacity: 1;
    }

    .back2top > a > img {
        width: 100%;
        height: 100%;
    }

    .overtitle {
        font-size: 20px;
        color: #fff;
        letter-spacing: 0.5px;
    }

    .syn {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 70px;
        background-color: #333;
        text-align: center;
        color: #fff;
        font-size: 20px;
        margin-bottom: -2px;
    }

    .syn > span {
        display: block;
        line-height: 70px;
        overflow: hidden;
    }

    .syn > span > b {
        color: crimson;
        transform: translateY(2px);
        display: inline-block;
    }

    .syn > span > a > img {
        display: inline-block;
        vertical-align: text-bottom;
        margin-left: 5px;
        height: 21px;
    }

    .just {
        text-align: justify;
    }
    textarea {
        height: 160px;
    }
    form {
        max-width: 600px;
        width: 100%;
        margin: 0 auto max(4vw, 80px);
    }

    form > div:not(:last-child) {
        margin-bottom: 10px;
    }

    .sel {
        border: 1px dotted #777;
        border-radius: 5px;
        background: #fafafa;
    }

    div.sel {
        border-radius: 8px;
    }

    .recuo {
        margin-top: 10vw;
    }

    #initial {
        margin: 4vw 15vw;
    }

    #resources,
    #downloads {
        margin-top: calc(40px + 12vw);
        margin-bottom: calc(10px + 5vw);
    }

    #downloads {
        background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='197.16mm' height='103.19mm' version='1.1' viewBox='0 0 197.16 103.19' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='7.1595' x2='242.05' y1='86.692' y2='201.64' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23fafafa' offset='0'/%3E%3Cstop stop-color='%23dadada' offset='1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cg transform='translate(-7.0502 -79.201)'%3E%3Cpath d='m184.09 145.62c-16.159 13.791-49.438 31.536-57.465 21.509-18.437-23.028-42.494 14.749-50.634-10.048-11.131-33.91-68.831 24.89-68.831 24.89v-95.28s59.288-12.52 95.434 0.38755c44.391 15.852 64.506-2.7992 81.813 19.229 8.0959 10.305 9.6902 30.771-0.31736 39.312z' fill='url(%23a)' fill-rule='evenodd'/%3E%3C/g%3E%3Crect x='187.91' y='4.7518' width='8.913' height='91.787' fill='none'/%3E%3C/svg%3E");
        background-size: cover;
        min-height: 105vh;
        margin-top: calc(10px + 1vw);
        display: block;
        background-repeat: no-repeat;
        background-position: top right;
    }

    #downloads div.subtitle {
        justify-content: center;
        margin-top: -20px;
        font-size: 20px;
    }

    #donate {
        margin-top: calc(10px + 0.3vw);
        display: block;
        min-height: 60vh;
        margin-top: -5vw;
    }

    #donate > div {
        display: flex;
        gap: 8%;
        flex-wrap: nowrap;
        margin: 0 15vw;
    }

    #donate > div > div:first-child {
        width: 25%;
    }

    #donate > div > div:first-child > img {
        width: 100%;
    }

    #donate h2 {
        color: #fff9c8;
    }

    #contact {
        position: relative;
        background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='210.43mm' height='70.567mm' version='1.1' viewBox='0 0 210.43 70.567' xmlns='http://www.w3.org/2000/svg' xmlns:cc='http://creativecommons.org/ns%23' xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns%23' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='92.241' x2='91.692' y1='112.83' y2='223.74' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23ccc' offset='0'/%3E%3Cstop stop-color='%23fff6d5' offset='1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cmetadata%3E%3Crdf:RDF%3E%3Ccc:Work rdf:about=''%3E%3Cdc:format%3Eimage/svg+xml%3C/dc:format%3E%3Cdc:type rdf:resource='http://purl.org/dc/dcmitype/StillImage'/%3E%3Cdc:title/%3E%3C/cc:Work%3E%3C/rdf:RDF%3E%3C/metadata%3E%3Cg transform='translate(0 -107.15)'%3E%3Cpath d='m0 107.15s21.88 19.038 35.139 24.158c18.757 7.244 41.273-23.293 60.679-21.139 30.727 3.4097 65.798 24.477 91.683 14.002 8.8223-3.5703 22.924-17.021 22.924-17.021v70.567h-210.43z' fill='url(%23a)' fill-rule='evenodd'/%3E%3C/g%3E%3C/svg%3E");
        background-size: cover;
        background-position: center top;
        min-height: 50vh;
        margin-top: calc(10px + 2vw);
        text-align: center;
        padding: 6vw 0 90px 0;
        box-sizing: border-box;
    }

    #contact > div {
        margin: 0 15vw;
        width: 100%;
        text-align: center;
    }

    #downloads > div {
        display: flex;
        gap: 6%;
        flex-wrap: wrap;
        margin: 0 15vw;
        justify-content: space-between;
    }

    #downloads > div > div:first-child {
        display: flex;
        gap: 0;
        flex-wrap: nowrap;
        padding: 1vw 0;
        width: 65%;
        justify-content: space-between;
    }



    #downloads > div div.os {
        text-align: center;
        padding: 10px;
        width: 160px;
    }

    #downloads > div div.os > div > a {
        display: inline-block;
        padding: 1px 5px;
        margin-bottom: 10px;
    }

    #downloads > div div.os > div > a:not(:last-child) {
        margin-right: 15px;
    }

    #downloads > div div.os h5 {
        text-transform: uppercase;
    }

    #downloads > div div.os img {
        width: max(6vw, 48px);
    }
    #downloads > div div.os div.links {
        margin-top: 15px;
    }

    #downloads > div > div:last-child {
        width: 21%;
    }

    #downloads > div > div:last-child > img {
        width: 100%;
        height: auto;
        object-fit: contain;
    }

    #resources ul {
        text-align: left;
    }

    #resources ul > li:first-child {
        margin-bottom: max(30px, 3vw);
    }

    #resources ul > li:not(:first-child) {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
        padding-bottom: 5px;
    }

    #resources ul > li.border:not(:last-child) {
        border-bottom: 1px dotted #ddd;
    }

    #resources ul h5 {
        text-transform: uppercase;
        color: #121969;
        margin: 10px 0 5px;
    }

    #resources ul p {
        margin-top: 0;
    }

    #resources ul img {
        height: 80px;
    }

    ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    ul.features {
        display: flex;
        gap: 8%;
        color: #fff;
    }

    ul.features > li {
        max-width: 200px;
        width: 100%;
        text-align: center;
    }

    ul.features > li > h6 {
        font-size: 20px;
        text-transform: uppercase;
        letter-spacing: 1.2px;
        margin: 10px 0;
    }

    ul.features > li > div {
    }

    ul.features > li > div > img {
        max-height: 98px;
        width: 8vw;
        object-fit: contain;
    }

    a {
        color: inherit;
        transition: all 0.4s ease;
    }
    section {
        display: flex;
        gap: 8%;
        justify-content: center;
    }

    section > div:last-child {
        text-align: left;
        padding: 0 20px;
    }

    .panda {
        position: absolute;
        right: 0;
        top: 28vw;
        width: calc(80px + 8vw);
    }
    div.nav {
        display: flex;
        justify-content: space-between;
        padding: 20px 20px 0;
        color: #fff;
    }

    /* ------------------------------------------------------ */
    nav.menu {
        margin: 10px auto 0;
        position: relative;
        width: auto;
        height: 40px;
        /* background-color: #34495e; */
        border-radius: 8px;
        font-size: 0;
        text-align: left;
        font-weight: bold;
        letter-spacing: 0.8px;
    }

    nav.menu a {
        line-height: 40px;
        height: 100%;
        font-size: 20px;
        display: inline-block;
        position: relative;
        z-index: 1;
        text-decoration: none;
        text-transform: uppercase;
        text-align: center;
        color: white;
        cursor: pointer;
        transform: translateY(-1px);
    }
    nav.menu .animation {
        position: absolute;
        height: 100%;
        top: 0;
        z-index: 0;
        transition: all 0.5s ease 0s;
        border-radius: 8px;
    }

    nav.menu a:first-child {
        width: 40px;
        pointer-events: none;
    }
    nav.menu a:nth-child(2) {
        width: 120px;
    }
    nav.menu a:nth-child(3) {
        width: 130px;
    }
    nav.menu a:nth-child(4) {
        width: 90px;
    }
    nav.menu a:nth-child(5) {
        width: 110px;
    }

    nav.menu a {
        width: 100px;
    }
    nav.menu a > img {
        height: 20px;
        transform: translateY(2px);
    }

    nav.menu .start-0,
    nav.menu a:nth-child(1):hover ~ .animation {
        width: 40px;
        left: 0;
        background-color: #ff0033;
        transform: translateY(2px);
    }
    nav.menu .start-1,
    nav.menu a:nth-child(2):hover ~ .animation {
        width: 120px;
        left: 40px;
        background-color: #ff0033;
    }
    nav.menu .start-2,
    nav.menu a:nth-child(3):hover ~ .animation {
        width: 130px;
        left: 160px;
        background-color: #ff0033;
    }
    nav.menu .start-3,
    nav.menu a:nth-child(4):hover ~ .animation {
        width: 90px;
        left: 290px;
        background-color: #ff0033;
    }
    nav.menu .start-4,
    nav.menu a:nth-child(5):hover ~ .animation {
        width: 110px;
        left: 380px;
        background-color: #ff0033;
    }

    @keyframes float {
        0% {
            box-shadow: 0 5px 15px 0px rgba(0, 0, 0, 0.6);
            transform: translate(0px, 0px);
        }
        50% {
            box-shadow: 0 25px 15px 0px rgba(0, 0, 0, 0.2);
            transform: translate(0px, -10px);
        } 
        100% {
            box-shadow: 0 5px 15px 0px rgba(0, 0, 0, 0.6);
            transform: translate(0px, 0px);
        }
    }

    @keyframes simplefloat {
        0% {
            transform: translate(0px, 0px);
        }
        50% {
            transform: translate(0px, -10px);
        } 
        100% {
            transform: translate(0px, 0px);
        }
    }    

    main {
        text-align: center;
        padding: 0;
        margin: 0 auto;
        background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8' standalone='no'%3F%3E%3Csvg xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:cc='http://creativecommons.org/ns%23' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns%23' xmlns:svg='http://www.w3.org/2000/svg' xmlns='http://www.w3.org/2000/svg' xmlns:sodipodi='http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd' xmlns:inkscape='http://www.inkscape.org/namespaces/inkscape' height='721.334' width='965.719' version='1.1' id='svg15' sodipodi:docname='wave2.svg' inkscape:version='1.0 (4035a4fb49, 2020-05-01)'%3E%3Cmetadata id='metadata19'%3E%3Crdf:RDF%3E%3Ccc:Work rdf:about=''%3E%3Cdc:format%3Eimage/svg+xml%3C/dc:format%3E%3Cdc:type rdf:resource='http://purl.org/dc/dcmitype/StillImage' /%3E%3C/cc:Work%3E%3C/rdf:RDF%3E%3C/metadata%3E%3Csodipodi:namedview inkscape:document-rotation='0' pagecolor='%23ffffff' bordercolor='%23666666' borderopacity='1' objecttolerance='10' gridtolerance='10' guidetolerance='10' inkscape:pageopacity='0' inkscape:pageshadow='2' inkscape:window-width='1920' inkscape:window-height='1017' id='namedview17' showgrid='false' inkscape:zoom='0.3945418' inkscape:cx='-280.28246' inkscape:cy='199.60467' inkscape:window-x='-8' inkscape:window-y='-8' inkscape:window-maximized='1' inkscape:current-layer='svg15' /%3E%3Cdefs id='defs7'%3E%3ClinearGradient gradientTransform='scale(1,1.5795008)' y2='98.425' x2='883.237' y1='50.592' x1='154.706' id='A' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%231cb34a' id='stop2' /%3E%3Cstop offset='1' stop-color='%23008033' id='stop4' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M 0.048,0.022 965.719,0 965.412,619.444 c 0,0 -168.735,107.681 -262.313,101.645 C 583.654,713.384 496.533,510.405 387.721,549.405 240.985,601.998 149.4672,602.11532 76.212,528.185 6.2822719,457.61079 73.915001,328.82176 58.68409,230.64384 46.524212,152.26168 0.048,0.022 0.048,0.022 Z' fill='%23dbe3db' fill-opacity='0.522' fill-rule='evenodd' id='path9' sodipodi:nodetypes='cccccaac' /%3E%3Cpath id='path11-2' fill='%23005500' d='M 8.0301858,14.124412 C 163.41408,356.13729 220.5017,145.28573 322.37256,242.93566 c 46.7813,44.84282 77.19112,138.56819 128.89081,163.82602 46.80171,22.86319 96.97902,-21.10635 145.70745,-20.12133 116.2574,2.3482 282.70397,106.82735 368.92018,53.27588 L 953.31615,18.194543 c -291.65174,0.05132 -591.73447,-0.629685 -869.625627,0 z' style='fill:%230b280b;stroke-width:1' sodipodi:nodetypes='cccccccc' /%3E%3Cpath sodipodi:nodetypes='cccccccccccccccccc' style='stroke-width:1' d='M 8.0301858,14.124412 C 163.41409,336.53109 231.62716,133.49637 333.49802,225.54843 c 46.7813,42.27217 77.19112,130.62465 128.89081,154.43455 46.80171,21.55254 96.97902,-19.89641 145.70745,-18.96786 116.2574,2.21359 271.57851,129.38269 357.79472,78.90111 L 964.44161,33.999755 H 949.63643 875.40632 785.96261 696.92735 608.09628 519.061 429.61731 340.58204 251.75097 162.71569 73.271999 Z' fill='%23005500' id='path11' /%3E%3Cpath style='fill:url(%23A);stroke-width:0.999998' fill='url(%23A)' d='M 0.048,0.03474902 C 152.229,314.2859 237.437,97.071379 344.685,187.1882 c 46.546,39.11161 75.6,127.32041 126.234,150.52802 45.837,21.00737 95.08,-23.45085 142.704,-18.48805 119.892,12.49385 267.829,169.89267 352.268,120.68806 L 965.719,0 948.123,0.48490675 h -72.7 -87.6 -87.2 -87 -87.2 -87.6 -87.2 -87 -87.2 -87.6 z' id='path13' /%3E%3C/svg%3E%0A");
        background-position: center -1px;
        background-size: 100% auto;
        background-repeat: no-repeat;
    }

    header {
        position: relative;
        margin: 0 5vw;
    }

    img.logo {
        height: max(calc(1.6vw + 30px), 36px);
        padding-top: 10px;
    }

    .hero {
        color: #fff9c8;
    }

    .hero h1 {
        font-family: "Teko", sans-serif;
        font-size: calc(18px + 1.2vw);
        text-transform: uppercase;
        color: #fff;
        margin: 0 0 10px 0;
    }



    .hero p.subtitle {
        text-shadow: 2px 2px 0 #888;
        font-size: calc(12px + 0.6vw);
        margin: 10px 0 2vw;
    }

    .visible {
        opacity: 1 !important;
    }

    #screen {
        opacity: 0;
        transition: all 0.5s ease;
    }

    img.screen {
        width: max(20vw, 250px);
        box-shadow: 3px 3px 20px 5px #444;
        transition: all 0.3s ease;
        animation: float 6s ease-in-out infinite;
        animation-fill-mode: both;
        transform: translatey(0px);
    }

    .strokeme {
        text-shadow: -1px -1px 0 #777, 1px -1px 0 #777, -1px 1px 0 #777,
            1px 1px 0 #777;
    }




    @media screen and (max-width: 1366px) {

        ul.features > li > h6 {
            font-size: 17px;
        }
    }

    @media screen and (max-width: 1280px) {

        ul.features {
            gap: 5%;
        }

        #downloads > div {
            margin: 0 3vw;
        }

        #donate > div {
            margin: 0 3vw;
        }
    }

    @media screen and (max-width: 1120px) {

        ul.features > li > h6 {
            text-shadow: 0 0 4px #000;
        }

        img.screen {
            width: 220px;
        }

        section {
            gap: 6%;
        }

        #initial {
            margin: 4vw 8px;
        }
    }

    @media screen and (max-width: 1024px) {

        #downloads > div > div:last-child {
            display: none;
        }

        #downloads > div > div:first-child {
            width: 100%;
        }

        #downloads > div {
            margin: 0;
        }

        header {
            margin: 0 20px;
        }

        .panda {
            display: none;
        }

        #initial {
            margin: 4vw 20px;
        }

        div.nav {
            padding: 0;
        }

        section {
            gap: 5%;
        }

        ul.features {
            gap: 20px;
        }

    }

    @media screen and (max-width: 900px) {

        #contact > div {
            margin: 0 12vw;
        }

        #donate > div {
            gap: 0;
            margin: 0;
        }

        #donate > div > div:first-child {
            width: 180px;
            box-sizing: border-box;
            padding-right: 20px;
        }

        ul.features {
            gap: 15px;
        }

        section {
            gap: 4%;
        }

        #initial {
            margin: 4vw;
        }

        img.screen {
            width: 190px;
        }

        .dropdown {
            transform: none;
            position: fixed;
            top: 50px;
            right: 15px;
        }

        #burger {
            display: inline-block;
            width: 32px;
            cursor: pointer;
            margin: 15px 0 0;
        }

        nav.menu {
            display: none;
        }

        .mobimenu {
            position: fixed;
            background: #fff;
            color: forestgreen;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 111;
            display: flex;
            animation: fadein 600ms forwards;
        }

        .mobimenu.closing {
            animation: fadeout 600ms forwards;
        }

        .mobimenu img#burger {
            display: none;
        }

        .mobimenu .animation {
            display: none;
        }

        @keyframes fadein {
            0% {
                opacity: 0;
            }
            100% {
                opacity: 1;
            }
        }

        @keyframes fadeout {
            0% {
                opacity: 1;
            }
            100% {
                opacity: 0;
            }
        }        

        .mobimenu #logomobi {
            display: block;
            position: fixed;
            top: 10px;
            left: 10px;
            height: 40px;
        }
        

        .mobimenu #close {
            display: block;
            position: fixed;
            top: 15px;
            right: 18px;
            height: 28px;
            transition: opacity 0.4s ease;
            opacity: 0.5;
            cursor: pointer;
        }
        .mobimenu #close:hover {
            opacity: 1;
        }

        .mobimenu #homelight {
            display: none;
        }

        .mobimenu #homedark {
            display: inline-block;
        }    

        .mobimenu nav.menu {
            font-size: larger;
            display: block;
            margin: auto;
            height: fit-content;
            text-align: center;
        }

        .mobimenu > nav.menu > a {
            padding: 12px 0;
            color: #333;
            display: block;
            margin: auto;
        }

        .mobimenu  > nav.menu > a:last-child {
            position: absolute;
            right: 10px;
            top: 10px;
            padding: 0;
        }

        nav.menu .animation {
            height: 40px;
        }

        nav.menu a:first-child {
            width: 130px;
            pointer-events: bounding-box;
        }
        nav.menu a:nth-child(2) {
            width: 130px;
        }
        nav.menu a:nth-child(3) {
            width: 130px;
        }
        nav.menu a:nth-child(4) {
            width: 130px;
        }
        nav.menu a:nth-child(5) {
            width: 130px;
        }

        nav.menu a {
            width: 130px;
        }
        nav.menu a > img {
            height: 20px;
            transform: translateY(2px);
        }

        nav.menu .start-0,
        nav.menu a:nth-child(1):hover ~ .animation {
            width: 130px;
            left: 0;
            top: 8px;
            background-color: #ff0033;
        }
        nav.menu .start-1,
        nav.menu a:nth-child(2):hover ~ .animation {
            width: 130px;
            left: 0;
            top: 72px;
            background-color: #ff0033;
        }
        nav.menu .start-2,
        nav.menu a:nth-child(3):hover ~ .animation {
            width: 130px;
            left: 0;
            top: 136px;
            background-color: #ff0033;
        }
        nav.menu .start-3,
        nav.menu a:nth-child(4):hover ~ .animation {
            width: 130px;
            left: 0;
            top: 200px;
            background-color: #ff0033;
        }
        nav.menu .start-4,
        nav.menu a:nth-child(5):hover ~ .animation {
            width: 130px;
            left: 0;
            top: 264px;
            background-color: #ff0033;
        }

    }

    @media screen and (max-width: 750px) {

        #contact > div {
            margin: 0 10vw;
        }

        .pandabamboo {
            left: 0;
        }

        #screen {
            display: none;
        }

        .overtitle, h1 {
            text-shadow: 1px 1px 4px #000;
        }

        #downloads div.subtitle {
            font-size: 16px;
            padding-top: 5px;
        }

    }

    @media screen and (max-width: 600px) {

        #contact > div {
            margin: 0 3vw;
        }

        .pandabamboo {
            left: -4vw;
            transform: rotate(45deg);
            bottom: 0px;
        }

        #donate > div {
            display: block;
        }

        #donate > div > div:first-child {
            padding: 0;
            width: 100%;
            text-align: center;
        }

        #donate > div > div:first-child > img {
            width: 180px;
        }

        #donate > div > div > p > img {
            margin: auto;
            display: block;
        }

        #donate > div > div > p:last-child {
            text-align: center;
        }

        section > div:last-child {
            padding: 0 10px;
        }

        ul.features {
            gap: 10px;
        }

        section {
            gap: 15px;
        }

        #initial {
            margin: 4vw 10px;
        }
    }

    @media screen and (max-width: 512px) {
        
        #contact > div {
            margin: 0;
        }

        #downloads > div div.os > div > a {
            display: block;
            padding: 0;
            margin-bottom: 10px;
            margin: 0!important;
        }

        #resources ul > li:not(:first-child) {
            display: block;
            margin-bottom: 20px;
            padding-bottom: 5px;
            text-align: center;
        }

        #resources ul p {
            text-align: justify;
        }

        .pandabamboo {
            left: -15vw;
        }
    }
</style>
