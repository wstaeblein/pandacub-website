<script>
    import { tick, onMount } from "svelte";
    import { fade } from 'svelte/transition';
    import { component_subscribe, hasContext, listen } from "svelte/internal";
    import { Email, HackerNews, Reddit, LinkedIn, Pinterest, Telegram, WhatsApp, Facebook, Twitter } from 'svelte-share-buttons-component';
    import Minidropdown from './Minidropdown.svelte';

    let otherApps = {};
    let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    let tmstart = new Date().getTime();
    let waitTime = 1200;
    let menuActive  =false;
    let menuClosing = false;
    let showAfter = false;
    let formMode = 0;
    let appid = 'pandacub-app';
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
    let flipped = false;
    let mddSetup = {
        active: false,
        title: "icons",
        mainclass: "colors",
        data: [],
    };
    let frmFields = { name: '', email: '', subject: '', message: '' };
    let formIsValid = false;





    $: if (ready) { setTimeout(() => { showAfter = true; }, 300)};



    window.addEventListener('scroll', function() { 
        const scrolledTo = window.scrollY + window.innerHeight;
        const totalHeight = document.documentElement.scrollHeight;
        const ele = this.document.querySelector('.clouds');

        if (window.scrollY > window.innerHeight * 0.5) {
            document.querySelector('.back2top').classList.remove('vanish');
        } else {
            document.querySelector('.back2top').classList.add('vanish');
        }

        if (scrolledTo >= totalHeight - 1) { 
            setTimeout(() => ele.classList.add('start'), Math.ceil(Math.random() * 5000));
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

            let p3 = new Promise(async (resolve) => {
                let response = await fetch('https://wstaeblein.github.io/myapps/json/data.json');
                if (response.ok) {
                    let tmp = await response.json();
                    resolve(tmp);
                } else {
                    resolve('');
                }
            });


            

            let resp = await Promise.all([p1, p2, p3]);
            let curSys = getOSInfo();

            data = resp[0]; 
            langData = resp[1]; 
            otherApps = resp[2];
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
            let url = `https://buymeacoffee.com/wstaeblein/panda-cub-app`;
            donateUrl = url;
    }

    function getOSInfo() {
        let resp = { os: "", arch: "" };

        if (navigator.appVersion.indexOf("Win") != -1) {
            resp.os = "windows";
            resp.arch = navigator.appVersion.indexOf("x64") != -1 ? "x64" : "i32";
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

    async function handleSubmit(event) {
        event.preventDefault();



        formMode = 1;
        await setTimeout(() => {}, 2000);           

        fetch("https://formsubmit.co/ajax/7dc2563d9edba8c49d33cba7ff4f6a59", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(frmFields)

        }).then(async () => { 
            formMode = 2;
            await tick();
            flipped = true;
            setTimeout(() => reset, 15000);

        }).catch(async (error) => {
            formMode = 3;
            await tick();
            flipped = true;

            console.log(error);
            setTimeout(() => reset, 15000);
        });            
        

    }

    function reset() {
        formMode = 0;
        flipped = false;
        myForm.reset();
    }

    function computeDownload(link, app, evt) {
        let obj = { os: app.os, arch: link.arch }
        fetch('/api/dwn', {
            method: 'POST',
            body: JSON.stringify(obj)
        });
    }

    
    function check() { 
        formIsValid = myForm.checkValidity()
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
                        {@html langData.hero.replace('$$', '<a href="https://tinypng.com/" target="_blank" rel="noopener">tinypng.com</a>')}
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
                <div>
                    <span>{langData.featuresobs}</span>
                    <br><br><a href="https://tinify.com/developers" class="button" target="_blank" rel="noopener"><span>tinypng.com</span></a>
                </div>
            </div>
        </section>

        <section id="downloads">
            <br />
            <h2 class="strokeme recuo" id="download">
                {langData.downloadstitle}
            </h2>
            <div class="subtitle">{langData.version}&nbsp;{data.appversion}{data.appversion[0] == '0' ? ' Beta' : ''}</div>
            <div>
                <div class="deploys">
                    {#each downloads as v}
                        <div class="os" class:sel={v.actual}>
                            <h5>{v.os}</h5>
                            <div>
                                <img src="/img/{v.id}.png" loading="lazy" alt={downloads.os} />
                            </div>
                            <div class="links">
                                {#each v.list as link}
                                    <a href={link.url} on:click={computeDownload.bind(this, link, v)} class:sel={link.actual} download="pandacub-{v.id}-{v.arch}-{v.version}">{link.desc}</a>
                                    <div class="installformat"><small>{link.format}</small></div>
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
                        <img src="/img/qrcode.png" loading="lazy" height="220" alt="QR Code" />
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

        {#if otherApps[currLang]}
            <section id="apps">
                <h2 class="strokeme">{langData.otherapps}</h2>
                <p>{langData.othersdesc}</p>

                <ul class="sites">
                    {#each otherApps[currLang] as site}
                        <li>
                            <a href={site.link} target="_blank">

                                <div><img src="{otherApps.imgs[site.id]}" alt="{site.name}" /></div>
                                <div class="desc">{site.desc}</div>
                            </a>
                        </li>
                    {/each}
                </ul>


            </section>
        {/if}

        <section id="contact">
            <div>
                <div class="clouds">
                    <div class="cloud"></div>
                    <div class="cloud_two"></div>
                    <div class="cloud_three"></div>
                </div>
                <h2 class="strokeme" id="contactlink">
                    {langData.contacttitle}
                </h2>

                <div class="flipcard">
                    <div class="cardbody" class:flipped={flipped}>
                        <form name="Contact" class="card" bind:this={myForm}>
                            <p class="just">
                                {langData.contacttext.first}<a
                                    href="mailto:hello@pandacub.app"
                                    >{langData.contacttext.link}</a
                                >{langData.contacttext.last}
                            </p>
                            <div>
                                <input type="text" name="name" bind:value={frmFields.name} placeholder={langData.placeholders.name} maxlength="50" minlength="3" on:input={check} required />
                            </div>
                            <div>
                                <input type="email" name="email" bind:value={frmFields.email} placeholder="Email" maxlength="80" on:input={check} required />
                            </div>                    
                            <div>
                                <input type="text" name="subject" bind:value={frmFields.subject} placeholder={langData.placeholders.subject} maxlength="80" on:input={check} required />
                            </div>
                            <div class="nogap">
                                <textarea name="message" bind:value={frmFields.message} placeholder={langData.placeholders.text} maxlength="4096" on:input={check} required />
                            </div>
                            <div class="nogap">&nbsp;<small class:hidden={formIsValid}>{langData.fillall}</small>&nbsp;</div>
                            <br>

                            {#if formMode == 0}
                                <button class="button" on:click|preventDefault={handleSubmit} class:disabled={!formIsValid}><span>{langData.sendmailbtn}</span></button>
                                <br><br><br>
                            {:else if formMode == 1}
                                <div class="formwait anim">
                                    <img alt="meditation" src="data:image/webp;base64,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" />
                                    <span>{langData.formwait}</span>
                                </div>
                            {/if}
                        </form> 
                        <div class="result card back">

                            <div class="thanks" class:shown={formMode == 2}>
                                <h1>{langData.formok}</h1>
                                <img src="/img/panda-thanks-{currLang}.png" alt="Thanks!" />
                                <h3>{langData.youropinion}</h3>
                                <p>{langData.betterprod}</p>
                                <nav>
                                    <button class="button" on:click={reset}><span>{langData.back}</span></button>
                                </nav>                
                            </div>    

                            <div class="error" class:shown={formMode == 3}>
                                <img src="/img/sad-panda.png" class="errimg" alt="error" />
                                <br>
                                <div class="formwait">
                                    <img alt="err" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAA8FBMVEUAAADxUknoSUHxUknxUknxUknxUknxUknpSULxUknxUknxUknxUknxUknxUknxUknxUknxUknxUkmvEA+zExK1FRS2FxW3FxazExLxUkmwERC0FBO1FhW5Ghi7GxrEJCG9HRvSMy3fQDnTNC/xUkmtDg7////W1tawExP5tbHiQzzYOTPyV07y8vL80M7yYlr95uSzJSXzZV3+9/fpvb3enJzLnJzIjY3HiIj7y8nRvLzgo6PLoKD4pJ/zcWm7OTn23t71xcPnubnmtbXNpqbqW1S2Ly/V0NDiqanUgID1g3zCcnLzcGjEUlLgUEq5RkZeS/FbAAAAJHRSTlMA9BDaro+F5AfszcZ1al1VOiYb9NuRhnDDt+2vrl5WOycczc18uB89AAACV0lEQVRYw52X2XLTMBRAJddLYydxmr17C9dKCyFdUihQ2rRAyw7//zcY0UG+V5YscR49c85IjqOFmejncZgmHIAnaRjnfeZFL1oDwlrUc7WDtrJxox246DEHIzxuTHRaYKXVseobGTSSbZj9LgcHeNfkR+BIVKuvh+BMuF7jb4IHm3ohBC9C+/z930MXvOmi35/7B3j1e8jgP8iU3wHC96/nQJjfnADh31cdkO//ZCGEuJujZ9dLIRYk0QoeAzEgzk/FHxbVwrF8dErGFT8OgGu+KihfFvAY+N8htPH4S18VkF9yew9V2jKA159y/qggfcXdM7RGyfUPD0BUeTPHfskKFXraR3wjSIH44sdRtRBpM5gvSYH44qGQBTWHPmCuhZXPRYEKfZYD4djmXxwVuJCzGLSC3ceFmIVgL1CfFEKWgnPhfenTQsoSsBaoTwsJ4+BY+CB9WuAMwF6gPi24Bl68UgFUYNzNn83qC5wljr6hkLDUzTcVnrDQzZe80ws7LHbxzYUxyx18S2FP/ztrPuKSBA6bFpSryxnmDPnDpiXtqihI4RcKjPRFlfq08IAC+/Zl/WUheV3xP+IZGDYW5dPCW/wKJoatTfm4QP1BULu53t8qHxWoX4wN2/vPCyGWXwrEt0/l/Im/FZgOGM/PVvrysVI6egOSjBYKB6bokOVfGBzgY553YZchIt/CiBFCv8K24bDtWpjWHdc9xrCNfP/3MDJfeVwKg13bpau5MD3wuvbRwtbE6+JJC4Nx4HP1pYXhJPC4fNPCcLRvEezX/6c7471DZuA34aDQlgz3i7oAAAAASUVORK5CYII=" />
                                    <span>{langData.formerror}</span>
                                </div>

                                <nav>
                                    <button class="button" on:click={reset}><span>{langData.back}</span></button>
                                </nav>                                       
                            </div>
                                           
                    
                        </div>   
                    </div>                
                </div>


                <div class="grass"></div>
                <div class="pandabamboo"><img src="/img/panda-bamboo.png" loading="lazy" alt="panda"></div>
                <div class="syn">
                    <span>{langData.syn.first}<b>&#10084;</b>{langData.syn.second} Walter Staeblein</span>
                </div>
            </div>
        </section>
    </main>
{:else}
    <div class="wait">
        <aside class="startscreen">
            <img alt="meditation" src="data:image/webp;base64,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" />
            <p>{langData.wait || ''}</p>
        </aside>
    </div>
{/if}

<style>
    .nogap {
        margin-bottom: 0 !important;
    }

    .nogap small {
        color: #888;
    }

    .installformat {
        height: auto;
        overflow: hidden;
        line-height: 1;
        padding: 0;
        transform: translateY(-5px);
    }

    .installformat > small {
        font-size: 15px;
    }

    ul.sites {
        list-style: none;
        padding: 0;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(min(260px, 100%), 1fr));
        grid-auto-rows: 1fr;
        gap: 10px;
        margin: 5px 15vw 8px;

    }


    ul.sites > li {
        transition: all 0.3s ease;
        font-size: 18px;
        padding: 0 10px 10px;
        border-radius: 9px;        
        border: 1px dotted #250a0a;
        cursor: pointer;
    }

    ul.sites > li > a {
        display: block;
        text-decoration: none;
        color: inherit;
    }

    ul.sites > li:hover {
        background: #fafafa;
        color: #005500;
        border: 1px dotted #005500;
    }

    ul.sites > li > a img {
        height: 140px;
        transition: transform 0.3s ease;
    }

    ul.sites > li:hover > a img {
        transform: scale(1.2);
    }



    .error {
        display: none;
        flex-direction: column;
        justify-content: center;
        align-items: center;        
    }

    .error img.errimg {
        width: max(calc(12vw + 44px), 180px);
    }

    .flipcard {
        perspective: 40rem;
        max-width: 600px;
        margin: auto;        
    }

    .flipcard > .cardbody {
        display: flex;
        transform-style: preserve-3d;
        transition: 0.8s transform;
    }

    .flipcard > .cardbody > .card {
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        min-width: 100%;        
    }

    .flipcard > .cardbody > .card.back {
        transform: rotateX(-180deg) translate(-100%, 0);
        height: 500px;
    }

    .flipped {
        transform: rotateX(-180deg);
    }

    h3 {
        margin: 0;
    }

    div.thanks h1 {
        margin: 0 0 10px 0;
    }

    div.thanks p {
        margin-bottom: 12px !important;
    }

    .result {
        /* margin: 0 auto max(4vw, 80px); */
    }

    .result > div.thanks {
        display: none;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 0.5vw;
        transform: translateY(-20px);
    }

    .result > div.thanks > img {
        width: max(calc(9vw + 20px), 180px);
        aspect-ratio: 1;
    }

    .result > div.thanks > p {
        margin: 0;
        text-align: center;
    } 

    .result > div.thanks > span.letter {
        color: #7aec8f;
        font-family: Teko;
        font-size: max(calc(12vw + 44px), 40px);
        display: inline-block;
        transform: translateY(6%);
        text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
    }

    .result h1 {
        color: rgb(6, 44, 6);
        font-size: 30px;
        text-transform: uppercase;
    }

    .formwait {
        display: flex;
        justify-content: center;
        gap: 15px;
        transform: translateY(-15px);
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
        width: clamp(150px, 50vw, 256px);
    }

    aside.startscreen > p {
        margin: 0;
        font-size: clamp(26px, 10vw, 52px);
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

    .deploys div.sel {
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
        background-size: contain;
        margin-top: calc(10px + 1vw);
        display: block;
        background-repeat: no-repeat;
        background-position: top left;
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


    #apps {
        display: block;
        margin-top: calc(10px + 5vw);
    }

    #apps h2 {
        color: #f2f2f2;
    }

    #contact {
        position: relative;
        background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0nVVRGLTgnPz48c3ZnIHdpZHRoPScyMTAuNDNtbScgaGVpZ2h0PSc3MC41NjdtbScgdmVyc2lvbj0nMS4xJyB2aWV3Qm94PScwIDAgMjEwLjQzIDcwLjU2NycgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB4bWxuczpjYz0naHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjJyB4bWxuczpkYz0naHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8nIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIycgeG1sbnM6eGxpbms9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0nYScgZ3JhZGllbnRUcmFuc2Zvcm09InJvdGF0ZSg5MCkiPjxzdG9wIHN0b3AtY29sb3I9JyM2MmMxZTUnIG9mZnNldD0nMjUlJy8+PHN0b3Agc3RvcC1jb2xvcj0nI2NmZWNmNycgb2Zmc2V0PSc5NSUnLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48bWV0YWRhdGE+PHJkZjpSREY+PGNjOldvcmsgcmRmOmFib3V0PScnPjxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PjxkYzp0eXBlIHJkZjpyZXNvdXJjZT0naHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UnLz48ZGM6dGl0bGUvPjwvY2M6V29yaz48L3JkZjpSREY+PC9tZXRhZGF0YT48ZyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSgwIC0xMDcuMTUpJz48cGF0aCBkPSdtMCAxMDcuMTVzMjEuODggMTkuMDM4IDM1LjEzOSAyNC4xNThjMTguNzU3IDcuMjQ0IDQxLjI3My0yMy4yOTMgNjAuNjc5LTIxLjEzOSAzMC43MjcgMy40MDk3IDY1Ljc5OCAyNC40NzcgOTEuNjgzIDE0LjAwMiA4LjgyMjMtMy41NzAzIDIyLjkyNC0xNy4wMjEgMjIuOTI0LTE3LjAyMXY3MC41NjdoLTIxMC40M3onIGZpbGw9J3VybCgjYSknIGZpbGwtcnVsZT0nZXZlbm9kZCcvPjwvZz48L3N2Zz4=');
        background-size: cover;
        background-position: center top;
        min-height: 50vh;
        margin-top: calc(10px + 2vw);
        text-align: center;
        padding: 6vw 0 0 0;
        box-sizing: border-box;
        overflow: hidden;
    }

    #contact > div {
        margin: 0;
        width: 100%;
        text-align: center;
        position: relative;
        inset: 0;
        z-index: 5;
    }

    #contact div.clouds {
        position: absolute;
        z-index: 0;
        inset: 0;
    }

    .cloud, .cloud_two, .cloud_three {
        border-radius: 50%;
        position: absolute;
        top: 30%;
        left: calc(100% + 100px);
        margin-top: -30px;
        margin-left: -30px;
        background: #FFFFFF;
        height: 60px;
        width: 60px;
        box-shadow: #FFFFFF 65px -15px 0 -5px,  #FFFFFF 25px -25px,  #FFFFFF 30px 10px,  #FFFFFF 60px 15px 0 -10px,  #FFFFFF 85px 5px 0 -5px;
    }

    :global(.clouds.start .cloud, .clouds.start .cloud_two, .clouds.start .cloud_three) {
        animation: move 56s linear infinite, wobble 9s ease infinite;
    }

    .cloud_two {
        top: 55%;
        left: calc(100% + 100px);
        animation-duration: 68s;
        animation-delay: 15s;
    }

    .cloud_three {
        top: 16%;
        left: calc(100% + 100px);
        animation-duration: 78s;
        animation-delay: 30s;
    }    

    @keyframes move {

        100% {
            left: -100px;
        }
    }

    @keyframes wobble {
        50% {
            transform: translateY(-16px);
        }
    }

    #downloads > div {
        display: flex;
        gap: 6%;
        flex-wrap: wrap;
        margin: 0 15vw;
        justify-content: space-between;
    }

    #downloads > div > div.deploys {
        display: flex;
        gap: 15%;
        flex-wrap: nowrap;
        padding: 1vw 0;
        width: 65%;
        justify-content: end;
    }



    #downloads > div div.os {
        text-align: center;
        padding: 10px 2em;
        width: 160px;
    }

    #downloads > div div.os > div > a {
        display: inline-block;
        padding: 1px 5px;
        margin-bottom: 10px;
    }

    #downloads > div div.os > div > a:not(:last-child) {
        margin: 0 8px;
    }

    #downloads > div div.os h5 {
        text-transform: uppercase;
    }

    #downloads > div div.os img {
        width: max(6vw, 48px);
        aspect-ratio: 1;
        object-fit: contain;
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

    #resources > div {
        margin-left: 15vw;
        margin-right: 15vw;
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
        width: 70px;
    }
    nav.menu a:nth-child(6) {
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
        width: 70px; 
        left: 380px;
        background-color: #ff0033;
    }
    nav.menu .start-5,
    nav.menu a:nth-child(6):hover ~ .animation {
        width: 110px;
        left: 450px;
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

        #social {
            display: none;
        }

        :global(.clouds.start .cloud, .clouds.start .cloud_two, .clouds.start .cloud_three) {
            animation: none;
        }        

        #contact > div {
            margin: 2em 0 0;
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

        #resources > div {
            margin-left: 10vw;
            margin-right: 10vw;
        }

        .dropdown {
            width: 40px;
            height: 40px;
            transform: none;
            position: fixed;
            top: 57px;
            right: 11px;
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
            padding: 8px 0;
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

        .recuo {
            margin-top: 10vh;
        }        
    }

    @media screen and (max-width: 768px) {



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
            padding: 5px 0 15px;
        }

        #resources > div {
            margin-left: 5vw;
            margin-right: 5vw;
        }        

    }

    @media screen and (max-width: 600px) {

/*         #contact > div {
            margin: 0 3vw;
        } */

        .formwait > img {
            display: none;
        }

        .formwait > span {
            font-size: 20px;
            margin-left: auto;
            display: inline-block;
            transform: translateY(-10px);
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
        
/*         #contact > div {
            margin: 0;
        } */

        form {
            text-align: right;
        }

        #downloads > div > div:first-child {
            justify-content: center;
            flex-wrap: wrap;
        }

        #downloads > div div.os {
            width: 40%;
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

        ul.sites {
            margin: 5px 15px 8px;
        }

        .syn {
            text-align: left;
            padding-left: 10px;
        }

        #resources > div {
            margin-left: 5px;
            margin-right: 5px;
        }

        .formwait > span {
            font-size: 18px;
        }
    }

    @media screen and (orientation: landscape) { 
        .menushare {
            margin-top: 0;
            display: flex;
        }
    }
</style>
