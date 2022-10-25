<script>
    import { component_subscribe, hasContext, listen } from "svelte/internal";
    import Minidropdown from './Minidropdown.svelte';

    let tmstart = new Date().getTime();
    let waitTime = 2000;
    let downloads = [],
        langData = {},
        data = {},
        menu = [],
        langList = {},
        ready = false;
    let currLang = localStorage.getItem("currlang") || (navigator.language || navigator.userLanguage).split("-").shift() || "en";
    let donateUrl = '';
    var mddSetup = {
        active: false,
        title: "icons",
        mainclass: "colors",
        data: [],
    };

    // PANDACUB MAIL
    // LOGIN: walter@pandacub.app
    // PWD: Ei]ohxOyp*vtawmndrfgj4zcqlk0be

    window.addEventListener('scroll', function() { console.log(window.scrollY, window.innerHeight * 0.5)
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
            console.log(resp); 
            let curSys = getOSInfo();

            data = resp[0]; 
            langData = resp[1]; console.log(langData)
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
            console.log(error);
            alert("Erro 1");
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

    async function setLang(lang) { console.log('----> ' + lang)
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
</script>

{#if ready}
    <main id="home">
        <span class="back2top vanish">
            <a href="#home"><img src="/img/back.png" alt="" /></a>
        </span>
        <img src="/img/pandacub.png" class="panda" alt="Panda Cub" />
        <header id="home">
            <div class="nav">
                <div>
                    <img
                        src="/img/logos/pandacub.png"
                        class="logo"
                        alt="Panda Cub Logo"
                    />
                </div>
                <div class="mobimenux">
                    <nav class="menu">
                        <a href="">
                            <img
                                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAdVBMVEUAAAD////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////li2ZAAAAAJnRSTlMAMvjoPRLY5ArvBcqeeSDdlbFrK72DS0Qm0KfTtpBkYBvEinNXT+b708MAAAGRSURBVEjH7ZLbdqsgEIYHZHRAxWM87CTm0IT3f8TdMDatbUO9atfq6ncjMv8HzAL4vZjj0cAMeghC2DJNs4HH3Sm9kdnA8ipxzyTKb7JxnkjAI+hQcKY40Cohj9xMtFkh2MzXpfSfzH4liMondbnX3qtEWBAj53PEJza2VUCgKeFue7AWVMzRxwJtIr9o24Pa7ZRRrQwKuOd61UA/SrntYKhCgmodt2tw8qas0ez1Q6Ef/XxSE57nlN4fqU4+F8wl5kxHWN1PLndInf5MwLPkdoVRqXvD2BvRcu2McMfO7WYNHGK3IJ5gyHhYWpgZKl4jQ1NH7h26NlhyvRpeHzO3azO5TPM6A00FRxS9Pubiaprdhzy33pgu5tBEL4857UGd3ANOCvqUD5hDyttaWhz/QyN05OOOcElut4uYSxdA5oildi65AD1pzX9BZIl4SxKAuSoAkYTzfNPqaoBZJzA/I7T/PO1aQXbo6eRaQYFH/QnfLTTFV0KxFCjfxne2c02Mb+ZygqUxiDsNzXPNYu738B8Xu4vqsiMoQwAAAABJRU5ErkJggg=="
                                alt="home"
                            />
                        </a>
                        {#each menu as m}
                            <a href="#{m.id}">{m.lbl}</a>
                        {/each}
                        <div class="animation start-0" />
                        <div class="dropdown">
                            <Minidropdown bind:value={currLang} setup={mddSetup} on:minidropdown={handleLang}></Minidropdown>
                        </div>
                        
                    </nav>
                </div>
            </div>
        </header>
        <section id="initial">
            <div>
                <img
                    src="/img/screens/{currLang}.png"
                    class="screen"
                    alt="Tela"
                />
            </div>
            <div>
                <div class="hero">
                    <div class="overtitle">{langData.overtitle}</div>
                    <h1 class="">{langData.title}</h1>
                    <p class="subtitle">
                        {langData.hero.first}<a
                            href="https://tinypng.com/"
                            rel="noopener">{langData.hero.link}</a
                        >{langData.hero.last}
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
            <div class="subtitle">{langData.version}&nbsp;{data.appversion}</div>
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

                <div class="form">
                    <p class="just">
                        {langData.contacttext.first}<a
                            href="mailto:ola@pandacub.app"
                            >{langData.contacttext.link}</a
                        >{langData.contacttext.last}
                    </p>
                    <div>
                        <input type="text" placeholder={langData.placeholders.name} />
                    </div>
                    <div>
                        <input type="text" placeholder={langData.placeholders.subject} />
                    </div>
                    <div>
                        <textarea placeholder={langData.placeholders.text} />
                    </div>
                    <br>
                    <a href="mailto:ola@pandacub.app" class="button" text="{langData.sendmailbtn}"><span>{langData.sendmailbtn}</span></a>
                </div>

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
        <aside>
            <img src="data:image/png;base64,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" alt="{langData.wait}">
            <p>{langData.wait || ''}</p>
        </aside>
    </div>
{/if}

<style>
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
    }

    .mobimenu ul {
        display: block !important;
        font-size: larger;
        width: 220px;
        margin: auto;
    }

    .mobimenu ul > li {
        padding: 12px 0;
    }

    .mobimenu ul > li:last-child {
        position: absolute;
        right: 10px;
        top: 10px;
        padding: 0;
    }

    .lang {
        height: 24px;
        border: 2px solid #fff;
        border-radius: 50%;
        vertical-align: middle;
    }

    aside {
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
    aside img {
        animation: simplefloat 4s ease-in-out infinite;
        animation-fill-mode: both;
    }

    aside > p {
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
    .form {
        max-width: 600px;
        width: 100%;
        margin: 0 auto 3vw;
    }

    .form > div:not(:last-child) {
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
        background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8' standalone='no'%3F%3E%3Csvg xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:cc='http://creativecommons.org/ns%23' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns%23' xmlns:svg='http://www.w3.org/2000/svg' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' id='svg8' version='1.1' viewBox='0 0 197.16405 103.19146' height='103.19146mm' width='197.16405mm'%3E%3Cdefs id='defs2'%3E%3ClinearGradient id='linearGradient878'%3E%3Cstop id='stop874' offset='0' style='stop-color:%23fafafa;stop-opacity:1;' /%3E%3Cstop id='stop876' offset='1' style='stop-color:%23dadada;stop-opacity:1' /%3E%3C/linearGradient%3E%3ClinearGradient gradientUnits='userSpaceOnUse' y2='201.64008' x2='242.04546' y1='86.691879' x1='7.159452' id='linearGradient880' xlink:href='%23linearGradient878' /%3E%3C/defs%3E%3Cg transform='translate(-7.0502082,-79.200966)' id='layer1'%3E%3Cpath d='m 184.08915,145.62108 c -16.15916,13.7909 -49.43799,31.53581 -57.46536,21.50947 C 108.18692,144.10252 84.129578,181.87909 75.990027,157.0827 64.858877,123.17268 7.1594519,181.97226 7.1594519,181.97226 V 86.691876 c 0,0 59.2875031,-12.520322 95.4339481,0.387547 44.39058,15.851847 64.50606,-2.799198 81.81311,19.229447 8.0959,10.30457 9.69021,30.77133 -0.31736,39.31221 z' style='fill:url(%23linearGradient880);fill-rule:evenodd;stroke:none;stroke-width:0.965003;stroke-linecap:round;stroke-linejoin:round;fill-opacity:1' id='path871' /%3E%3C/g%3E%3C/svg%3E%0A");
        background-size: cover;
        min-height: 115vh;
        margin-top: calc(10px + 1vw);
        display: block;
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
        gap: 10%;
        flex-wrap: wrap;
        margin: 0 15vw;
    }

    #donate > div > div:first-child {
        max-width: 320px;
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
        gap: 10%;
        flex-wrap: wrap;
        margin: 0 15vw;
    }

    #downloads > div > div:first-child {
        display: flex;
        gap: 15%;
        flex-wrap: wrap;
        padding: 1vw 0;
        width: 65%;
    }

    #downloads > div div.os {
        text-align: center;
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
        width: 70%;
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
        margin-bottom: 4rem;
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
        height: 52px;
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

    h2 {
        font-family: "Teko", sans-serif;
        font-size: calc(14px + 1.6vw);
        text-transform: uppercase;
        color: #fff;
        margin: 0 0 10px 0;
        letter-spacing: 2px;
    }

    .hero p.subtitle {
        text-shadow: 2px 2px 0 #888;
        font-size: calc(12px + 0.6vw);
        margin: 10px 0 2vw;
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
    }

    @media screen and (max-width: 1120px) {

        ul.features > li > h6 {
            text-shadow: 0 0 4px #000;
        }

        img.screen {
            width: 220px;
        }
    }
</style>
