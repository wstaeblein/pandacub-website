<script>
    import { component_subscribe, hasContext, listen } from "svelte/internal";

    let versions = [], langs = {}, langData = {}, menu = [], ready = false;
    let currLang = (navigator.language || navigator.userLanguage).split('-').shift() || 'en'; 

    

    async function loadV() {
        try {
            let resp = await fetch('/build/data.json');
            let json = await resp.json();
            let curSys = getOSInfo(); 

            json.versions.forEach(ele => { 
                if (ele.os.toLowerCase() == curSys.os) { ele.actual = true; } 
                if (curSys.arch) {
                    ele.list.forEach((l) => l.actual = curSys.arch == l.arch.toLowerCase());
                }
            });
            versions = json.versions;
            langs = json.languages;
            setLang(currLang);
            ready = true;

        } catch (error) {   
            console.log(error);
            alert('Erro 1');
        }
    }

    loadV();

    function getOSInfo() {
        let resp = { os: '', arch: '' }

        if (navigator.appVersion.indexOf("Win") != -1) { 
            resp.os = 'windows'
            resp.arch = navigator.appVersion.indexOf("x64") != -1 ? 'x64' : 'i32';
        }
        if (navigator.appVersion.indexOf("Mac") != -1) { resp.os = "macos"; }
        if (navigator.appVersion.indexOf("X11") != -1) { resp.os = "unix"; }
        if (navigator.appVersion.indexOf("Linux") != -1) { resp.os = "linux"; }
        return resp.os ? resp : null;
    }

    function setLang(lang) {
        langData = langs[lang];
        currLang = lang;
        menu = Object.entries(langData.menu).map(entry => { return { id: entry[0], lbl: entry[1]}; });
        console.log(menu)
    }

</script>

{#if ready}
    <main id="home">
        <span class="back2top">
            <a href="#home"><img src="/img/back.png" alt=""></a>
        </span>
        <img src="/img/pandacub.png" class="panda" alt="Panda Cub">   
        <header id="home">
            <nav>
                <div><img src="/img/logos/pandacub.png" class="logo" alt="Panda Cub Logo">   </div>
                <div>
                    <ul class="menu">
                        {#each menu as m}
                            <li><a href="#{m.id}">{m.lbl}</a></li>
                        {/each}
                    </ul>
                </div>
            </nav>
        
        
        </header>
        <section id="initial">
            <div>
                <img src="/img/screens/{currLang}.png" class="screen" alt="Tela"> 
            </div>
            <div>
                <div class="hero">
                    <div class="overtitle">{langData.overtitle}</div>
                    <h1 class="">{langData.title}</h1>
                    <p class="subtitle">{langData.hero.first}<a href="https://tinypng.com/" rel="noopener">{langData.hero.link}</a>{langData.hero.last}</p>                
                </div>
                <ul class="features">
                    {#each langData.herocards as hc}
                        <li>
                            <div><img src="/img/{hc.img}" alt="{hc.text}"></div>
                            <h6>{hc.text}</h6>
                        </li>
                    {/each}                
                </ul>
            </div>
        </section>

        <section id="resources">
            <ul>
                <li>
                    <h2 class="strokeme">{langData.featurestitle}</h2>
                </li>
                {#each langData.featurelist as fl}
                    <li>
                        <h5>{fl.title}</h5>
                        <p>{fl.text}</p>
                    </li>
                {/each}

                <li>
                    <p>{langData.featuresobs.first}<a href="https://tinypng.com" target="_blank" rel="noopener">{langData.featuresobs.link}</a>{langData.featuresobs.last}</p>
                </li>                                            
            </ul>
            
        </section>

        <section id="downloads">
            <br>
            <h2 class="strokeme recuo" id="downloadlink">{langData.downloadstitle}</h2>

            <div>
                <div>
                    {#each versions as v}
                        <div class="os" class:sel={v.actual}>
                            <h5>{v.os}</h5>
                            <div>
                                <img src="/img/{v.id}.png" alt="{versions.os}">
                            </div>
                            <div class="links">
                                    {#each v.list as link}
                                        <a href="{link.url}" class:sel={link.actual} download="pandacub-{v.id}-{v.arch}-{v.version}">{link.desc}</a>
                                    {:else}
                                        <span>{langData.soon}</span>                                    
                                    {/each}
                            </div>
                        </div>
                    {/each}                    
                </div>
                <div>
                    <img src="/img/pandacub-sit.png" alt="Sitting panda cub">
                </div>            
            </div>

        </section>

        <section id="donate">
            <h2 class="strokeme">{langData.donationtitle}</h2>
            <div>
                <div>
                    <img src="/img/piggy.png" alt="Piggy">
                </div>
                <div>
                    <p>{@html langData.donationtext1}</p>

                    <p>{@html langData.donationtext2}</p>

                    <p>
                        <img src="/img/qrcode.png" alt="QR Code">
                    </p>
                    <br>
                    <p>
                        <a href="https://www.paypal.com/donate/?business=S6B6QN3QR6B7S&no_recurring=0&item_name=Obrigado+por+ajudar+a+manter+o+Panda+Cub+forte+e+saud%C3%A1vel%21&currency_code=BRL" target="_blank">{langData.donatebtn}</a>
                    </p>
                </div>
            </div>

        </section>

        <section id="contact">
            <div>
                <h2 class="strokeme" id="contactlink">{langData.contacttitle}</h2>
                
                <div class="form">
                    <p class="just">{langData.contacttext.first}<a href="mailto:ola@pandacub.app">{langData.contacttext.link}</a>{langData.contacttext.last}</p>
                    <div>
                        <input type="text" placeholder="{langData.placeholders.name}">
                    </div>
                    <div>
                        <input type="text" placeholder="{langData.placeholders.subject}">
                    </div>                
                    <div>
                        <textarea placeholder="{langData.placeholders.text}"></textarea>
                    </div>
                    
                    <a href="mailto:ola@pandacub.app">{langData.sendmailbtn}</a>
                </div> 
                
                <div class="syn">
                    <span>{langData.syn.first}<b>&#10084;</b>{langData.syn.second}<a href="https://synergys.component_subscribe.br" alt="Website Synergys" target="_blank" rel="noopener">
                    <img src="data:image/svg+xml,%3Csvg height='30px' style='cursor: pointer; pointer-events: all;' version='1.1' viewBox='0 0 116.50067 14.90286' xmlns='http://www.w3.org/2000/svg' xmlns:cc='http://creativecommons.org/ns%23' xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns%23' xmlns:xlink='http://www.w3.org/1999/xlink'%3E' + %3Cg transform='translate(157.29 -32.162)'%3E%3Cg fill-rule='evenodd'%3E%3Ccircle cx='-149.84' cy='39.556' r='6.9285' fill='%23fff' style='paint-order:markers fill stroke'%3E%3C/circle%3E%3Cpath d='m-149.84 32.162a7.4514 7.4514 0 0 0 -7.4514 7.4514 7.4514 7.4514 0 0 0 7.4514 7.4514 7.4514 7.4514 0 0 0 7.4514 -7.4514 7.4514 7.4514 0 0 0 -7.4514 -7.4514zm4.6384 2.8893c0.0426-0.0012 0.0645 0.0018 0.0609 0.0098-4e-3 0.0083-0.40137 0.15865-0.88352 0.33419-2.1841 0.7952-3.6774 1.5659-4.7286 2.4404-0.77618 0.64573-1.0705 1.1163-1.0472 1.6742 0.0199 0.47428 0.21819 0.72668 0.71751 0.91307 0.39773 0.14847 1.0508 0.22298 1.5716 0.1793 0.18353-0.0154 0.3398-0.01156 0.34726 0.0085 0.0201 0.05416-0.50225 0.40685-0.86819 0.58619-1.9102 0.93609-4.0136 0.15267-4.0555-1.5104 0.0176-0.87834 0.76752-1.6787 1.3293-2.1326 1.1081-0.88679 2.9103-1.6246 5.1893-2.1245 0.75245-0.16504 2.069-0.37113 2.3672-0.3782zm-2.438 3.2665c0.60369-0.0012 1.1756 0.15052 1.6217 0.44804 0.41738 0.27839 0.62462 0.51811 0.79032 0.91414 0.25262 0.71654 0.0937 1.2655-0.21675 1.7236-1.048 1.5424-4.2193 2.6188-8.1161 2.7547-0.75625 0.02641-1.0324 0.02331-1.0165-0.01144 5e-3 -0.01047 0.22602-0.06495 0.49152-0.12102 1.2863-0.27164 2.9426-0.7905 3.9269-1.2302 2.2269-0.9948 3.1354-2.003 2.627-2.9153-0.21789-0.39095-1.0218-0.70574-1.9423-0.76052-0.246-0.01461-0.45271-0.0412-0.45932-0.05903-0.0201-0.05404 0.60478-0.36812 1.0399-0.52279 0.41266-0.14666 0.84058-0.21924 1.2536-0.22014z' fill='%232ebff4' style='paint-order:markers fill stroke'/%3E%3C/g%3E%3Cg fill='%23fff'%3E%3Cpath d='m-137.49 43.561q-0.27844 0-0.27844-0.31256v-0.74087q0-0.31256 0.27844-0.31256h6.0078l-5.044-2.5583q-0.40694-0.20837-0.66396-0.42832-0.25702-0.23152-0.40695-0.47462-0.13921-0.25468-0.19276-0.5325-0.0428-0.27783-0.0428-0.59038 0-0.38201 0.12851-0.7293 0.12851-0.35886 0.38553-0.62511 0.26773-0.27783 0.65326-0.42832 0.39623-0.16207 0.91026-0.16207h7.8819q0.28915 0 0.28915 0.30098v0.74087q0 0.31256-0.28915 0.31256h-5.8043l5.0333 2.5583q0.41766 0.20837 0.66396 0.4399 0.25702 0.21995 0.39625 0.47462 0.14992 0.2431 0.19275 0.5325 0.0536 0.27783 0.0536 0.59038 0 0.38201-0.12851 0.74087-0.12851 0.34729-0.39623 0.62511-0.25702 0.26625-0.64255 0.42832-0.38552 0.15049-0.89956 0.15049z'/%3E%3Cpath d='m-122.79 43.561q-0.27843 0-0.27843-0.31256v-2.7551l-3.8446-4.4337q-0.0964-0.10418-0.0964-0.20837 0-0.09261 0.0643-0.13891 0.0643-0.04631 0.14992-0.04631h4.3158q0.28915 0 0.48191 0.23152l2.8486 3.3802 2.9664-3.3918q0.11781-0.12734 0.21419-0.17364 0.0964-0.04631 0.25702-0.04631h0.62112q0.10709 0 0.14993 0.05788 0.0536 0.04631 0.0536 0.11576 0 0.09261-0.0536 0.15049l-3.8767 4.4337v2.8246q0 0.31256-0.28915 0.31256z'/%3E%3Cpath d='m-102.67 43.561q-0.32127 0-0.56758-0.04631-0.2356-0.04631-0.589-0.18522l-8.5351-3.4497v3.3687q0 0.31256-0.28914 0.31256h-1.3815q-0.28914 0-0.28914-0.31256v-7.2814q0-0.30098 0.28914-0.30098h1.3172q0.17134 0 0.31057 0.01157 0.13921 0 0.26772 0.02315t0.25702 0.06946q0.13921 0.04631 0.31056 0.11576l7.9676 3.3224v-3.2413q0-0.30098 0.28915-0.30098h1.3815q0.28914 0 0.28914 0.30098v7.2814q0 0.31256-0.28914 0.31256z'/%3E%3Cpath d='m-94.932 39.937q-0.28914 0-0.28914-0.30098v-0.75245q0-0.30098 0.28914-0.30098h5.1189q0.27844 0 0.27844 0.20837v0.93767q0 0.20837-0.27844 0.20837zm-2.2917 3.6233q-0.76034 0-1.4029-0.2894-0.64255-0.30098-1.1138-0.82191-0.4712-0.5325-0.73892-1.2502-0.25702-0.7293-0.25702-1.5859 0-0.84506 0.24631-1.5628 0.25702-0.7293 0.71752-1.2618 0.46049-0.5325 1.103-0.82191 0.65325-0.30098 1.4457-0.30098h7.4856q0.28914 0 0.28914 0.30098v0.74087q0 0.31256-0.28914 0.31256h-4.9797q-0.3534 0-0.59971 0.08103-0.2356 0.08103-0.38553 0.2894t-0.21418 0.55566q-0.06425 0.34728-0.06425 0.87979v1.2618q0 0.59038 0.07497 0.99555 0.07496 0.40517 0.22489 0.64826 0.16064 0.2431 0.39624 0.35886 0.2356 0.10418 0.56758 0.10418h5.0118q0.28915 0 0.28915 0.31256v0.74087q0 0.31256-0.28915 0.31256z'/%3E%3Cpath d='m-79.438 43.561q-0.42836 0-0.7068-0.31256l-3.2234-3.577q-0.08567-0.0926-0.13922-0.17364-0.04284-0.09261-0.04284-0.25468v-0.35886q0-0.30098 0.27844-0.30098h1.4671q0.51404 0 0.76034-0.20837 0.25702-0.20837 0.25702-0.57881 0-0.7756-1.0174-0.7756h-2.3881v6.228q0 0.31256-0.28914 0.31256h-3.6732q-0.28914 0-0.28914-0.31256v-7.2814q0-0.30098 0.28914-0.30098h9.3597q0.48191 0 0.89956 0.15049 0.41765 0.13891 0.71751 0.40517 0.31056 0.26625 0.48191 0.63669t0.17135 0.82191q0 0.4862-0.17135 0.87979-0.16064 0.38201-0.44978 0.65984-0.27844 0.27783-0.66396 0.45147-0.37482 0.17364-0.80318 0.2431l2.9557 3.2761q0.07496 0.06946 0.07496 0.18522 0 0.06946-0.05354 0.12734-0.04284 0.05788-0.13922 0.05788z'/%3E%3Cpath d='m-72.125 43.561q-0.76034 0-1.4029-0.2894-0.64254-0.30098-1.1137-0.82191-0.4712-0.5325-0.73892-1.2502-0.25702-0.7293-0.25702-1.5859 0-0.84506 0.24631-1.5628 0.25702-0.7293 0.71751-1.2618t1.103-0.82191q0.65325-0.30098 1.4457-0.30098h7.4642q0.28914 0 0.28914 0.30098v0.74087q0 0.31256-0.28914 0.31256h-4.9583q-0.3534 0-0.59971 0.08103-0.2356 0.08103-0.38553 0.2894t-0.21418 0.55566q-0.06425 0.34728-0.06425 0.87979v1.2618q0 0.59038 0.07496 0.99555t0.22489 0.64826q0.16064 0.2431 0.39624 0.35886 0.2356 0.10418 0.56758 0.10418h1.8955v-3.5423q0-0.31256 0.27844-0.31256h3.0628q0.28914 0 0.28914 0.31256v4.5957q0 0.31256-0.28914 0.31256z'/%3E%3Cpath d='m-59.222 43.561q-0.27844 0-0.27844-0.31256v-2.7551l-3.8446-4.4337q-0.09638-0.10418-0.09638-0.20837 0-0.09261 0.06426-0.13891 0.06426-0.04631 0.14993-0.04631h4.3158q0.28914 0 0.48191 0.23152l2.8486 3.3802 2.9664-3.3918q0.1178-0.12734 0.21418-0.17364 0.09638-0.04631 0.25702-0.04631h0.62113q0.10709 0 0.14993 0.05788 0.05354 0.04631 0.05354 0.11576 0 0.09261-0.05354 0.15049l-3.8767 4.4337v2.8246q0 0.31256-0.28914 0.31256z'/%3E%3Cpath d='m-50.939 43.561q-0.27844 0-0.27844-0.31256v-0.74087q0-0.31256 0.27844-0.31256h6.0078l-5.044-2.5583q-0.40694-0.20837-0.66396-0.42832-0.25702-0.23152-0.40694-0.47462-0.13922-0.25468-0.19276-0.5325-0.04284-0.27783-0.04284-0.59038 0-0.38201 0.12851-0.7293 0.12851-0.35886 0.38553-0.62511 0.26773-0.27783 0.65325-0.42832 0.39624-0.16207 0.91027-0.16207h7.8819q0.28914 0 0.28914 0.30098v0.74087q0 0.31256-0.28914 0.31256h-5.8043l5.0333 2.5583q0.41765 0.20837 0.66396 0.4399 0.25702 0.21995 0.39624 0.47462 0.14993 0.2431 0.19276 0.5325 0.05354 0.27783 0.05354 0.59038 0 0.38201-0.12851 0.74087-0.12851 0.34729-0.39624 0.62511-0.25702 0.26625-0.64254 0.42832-0.38553 0.15049-0.89956 0.15049z'/%3E' +%0A%3C/g%3E%3C/g%3E%3C/svg%3E" alt="Logo Synergys">
                    </a></span>
                </div>
            </div>

        </section>
    </main>
{:else}
    <aside>Aguarde</aside>
{/if}

<style>
    .back2top {
        position: fixed;
        bottom: 10px;
        right: 10px;
        width: 48px;
        height: 48px;
        z-index: 11;
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
        height: 50px;
        background-color: #333;
        text-align: center;
        color: #fff;
        font-size: 20px;
        margin-bottom: -2px;
    }

    .syn > span {
        display: block;
        line-height: 50px;
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

    #resources, #downloads {
        margin-top: calc(40px + 15vw);
        margin-bottom: calc(10px + 5vw);
    }

    #downloads {
        background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8' standalone='no'%3F%3E%3Csvg xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:cc='http://creativecommons.org/ns%23' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns%23' xmlns:svg='http://www.w3.org/2000/svg' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' id='svg8' version='1.1' viewBox='0 0 197.16405 103.19146' height='103.19146mm' width='197.16405mm'%3E%3Cdefs id='defs2'%3E%3ClinearGradient id='linearGradient878'%3E%3Cstop id='stop874' offset='0' style='stop-color:%23fafafa;stop-opacity:1;' /%3E%3Cstop id='stop876' offset='1' style='stop-color:%23dadada;stop-opacity:1' /%3E%3C/linearGradient%3E%3ClinearGradient gradientUnits='userSpaceOnUse' y2='201.64008' x2='242.04546' y1='86.691879' x1='7.159452' id='linearGradient880' xlink:href='%23linearGradient878' /%3E%3C/defs%3E%3Cg transform='translate(-7.0502082,-79.200966)' id='layer1'%3E%3Cpath d='m 184.08915,145.62108 c -16.15916,13.7909 -49.43799,31.53581 -57.46536,21.50947 C 108.18692,144.10252 84.129578,181.87909 75.990027,157.0827 64.858877,123.17268 7.1594519,181.97226 7.1594519,181.97226 V 86.691876 c 0,0 59.2875031,-12.520322 95.4339481,0.387547 44.39058,15.851847 64.50606,-2.799198 81.81311,19.229447 8.0959,10.30457 9.69021,30.77133 -0.31736,39.31221 z' style='fill:url(%23linearGradient880);fill-rule:evenodd;stroke:none;stroke-width:0.965003;stroke-linecap:round;stroke-linejoin:round;fill-opacity:1' id='path871' /%3E%3C/g%3E%3C/svg%3E%0A");
        background-size: cover;
        min-height: 115vh;
        margin-top: calc(10px + 1vw);
        display: block;
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
        padding: 6vw 0 50px 0;
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

    #resources ul h5 {
        text-transform: uppercase;
        color: forestgreen;
        margin: 10px 0 5px;
    }

    #resources ul p {
        margin-top: 0;
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
    }

    ul.features > li > div {
        
    }

    ul.features > li > div > img {
        max-height: 98px;
        width: 90%;
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
    nav {
        display: flex;
        justify-content: space-between;
        padding: 20px;
        color: #fff;
    }

    nav ul.menu {
        display: flex;
        gap: 20px;
    }
	main {
		text-align: center;
		padding: 0;
		margin: 0 auto;
	}

    header {
        position: relative;
        margin: 0 5vw;
    }

    img.logo {
        height: 48px;
    }


    .hero {
        color: #fff9c8;
    }

    .hero h1 {
        font-family: 'Teko', sans-serif;
        font-size: calc(18px + 1.2vw);
        text-transform: uppercase;
        color: #fff;
        margin: 0 0 10px 0;
    }

    h2 {
        font-family: 'Teko', sans-serif;
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
        width: max(20vw, 150px);
        box-shadow: 3px 3px 20px 5px #444;
    }

    .strokeme {
        text-shadow: -1px -1px 0 #777, 1px -1px 0 #777, -1px 1px 0 #777, 1px 1px 0 #777;

    }

	@media (min-width: 640px) {

	}
</style>