import{CloseOnSelect as H,DsElement as d,DsFormElement as S,HostLayoutController as z,LitElement as E,PREFIX as M,PopoverController as A,boxOf as T,classMap as V,createRef as I,css as W,define as v,enter as q,firstFocusable as L,flagsOf as D,html as t,icon as B,iconMarkup as Z,ifDefined as F,keyed as O,leave as P,literal as R,live as U,measure as N,menuRows as j,missingMessage as K,move as X,noChange as G,nothing as s,onMenuRows as J,place as Q,popoverStyles as Y,ref as _,render as ee,repeat as te,runTransition as ae,styleMap as se,svg as ie,tag as r,tagName as re,uid as ne,unsafeCSS as y,unsafeHTML as oe,unsafeStatic as le,within as ce}from"./shared.js";import{staticHtml as l,unsafeStatic as me,literal as ge}from"./shared.js";import"./button.js";import"./field.js";import"./input.js";import"./native-select.js";import"./pixel-button.js";import"./textarea.js";var x=y(`/*! tailwindcss v4.3.4 | MIT License | https://tailwindcss.com */
@layer properties;@layer theme{:root,:host{--spacing:.25rem;--default-transition-duration:.15s;--default-transition-timing-function:cubic-bezier(.4, 0, .2, 1)}}@layer base,components;@layer utilities{.static{position:static}.mx-auto{margin-inline:auto}.mt-1\\.5{margin-top:calc(var(--spacing) * 1.5)}.mt-2{margin-top:calc(var(--spacing) * 2)}.mt-4{margin-top:calc(var(--spacing) * 4)}.mt-6{margin-top:calc(var(--spacing) * 6)}.mt-8{margin-top:calc(var(--spacing) * 8)}.mt-12{margin-top:calc(var(--spacing) * 12)}.flex{display:flex}.inline-block{display:inline-block}.h-8{height:calc(var(--spacing) * 8)}.min-h-dvh{min-height:100dvh}.w-auto{width:auto}.max-w-140{max-width:calc(var(--spacing) * 140)}.cursor-pointer{cursor:pointer}.flex-col{flex-direction:column}.flex-wrap{flex-wrap:wrap}.items-center{align-items:center}.gap-3{gap:calc(var(--spacing) * 3)}.gap-4{gap:calc(var(--spacing) * 4)}.gap-6{gap:calc(var(--spacing) * 6)}.border{border-style:var(--tw-border-style);border-width:1px}.border-edge{border-color:var(--ds-color-edge)}.bg-surface{background-color:var(--ds-color-surface)}.bg-surface-danger{background-color:var(--ds-color-surface-danger)}.p-4{padding:calc(var(--spacing) * 4)}.px-3{padding-inline:calc(var(--spacing) * 3)}.px-4{padding-inline:calc(var(--spacing) * 4)}.py-2{padding-block:calc(var(--spacing) * 2)}.py-12{padding-block:calc(var(--spacing) * 12)}.type-heading-3{font-family:var(--ds-font-heading);font-size:var(--ds-text-heading-3);line-height:var(--ds-text-heading-3-leading);font-weight:var(--ds-font-weight-regular);letter-spacing:0}.type-heading-4{font-family:var(--ds-font-heading);font-size:var(--ds-text-heading-4);line-height:var(--ds-text-heading-4-leading);font-weight:var(--ds-font-weight-regular);letter-spacing:0}.type-meta{font-family:var(--ds-font-text);font-size:var(--ds-text-meta);line-height:var(--ds-text-meta-leading);font-weight:var(--ds-font-weight-regular);letter-spacing:0}.type-ui{font-family:var(--ds-font-text);font-size:var(--ds-text-ui);line-height:var(--ds-text-ui-leading);font-weight:var(--ds-font-weight-regular);letter-spacing:0}.wrap-anywhere{overflow-wrap:anywhere}.text-fg{color:var(--ds-color-fg)}.text-fg-muted{color:var(--ds-color-fg-muted)}.text-fg-soft{color:var(--ds-color-fg-soft)}.tabular-nums{--tw-numeric-spacing:tabular-nums;font-variant-numeric:var(--tw-ordinal, ) var(--tw-slashed-zero, ) var(--tw-numeric-figure, ) var(--tw-numeric-spacing, ) var(--tw-numeric-fraction, )}.underline{text-decoration-line:underline}.decoration-edge-strong{-webkit-text-decoration-color:var(--ds-color-edge-strong);-webkit-text-decoration-color:var(--ds-color-edge-strong);text-decoration-color:var(--ds-color-edge-strong)}.underline-offset-4{text-underline-offset:4px}.transition-\\[text-decoration-color\\]{transition-property:text-decoration-color;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.duration-200{--tw-duration:.2s;transition-duration:.2s}.ease-standard{--tw-ease:var(--ds-easing-standard);transition-timing-function:var(--ds-easing-standard)}@media (hover:hover){.hover\\:decoration-fg:hover{-webkit-text-decoration-color:var(--ds-color-fg);-webkit-text-decoration-color:var(--ds-color-fg);text-decoration-color:var(--ds-color-fg)}}@media (min-width:48rem){.md\\:py-24{padding-block:calc(var(--spacing) * 24)}}}.ds-access-loading{animation:ds-access-appear var(--ds-duration-enter) var(--ds-easing-standard) .3s both}@keyframes ds-access-appear{0%{opacity:0}}@media (prefers-reduced-motion:reduce){.ds-access-loading{animation-duration:0s}}`);var w="M89.9457 0C78.5373 44.7769 44.0171 80.8044 0 93.9101V76.5306C31.3148 65.2608 53.8763 35.2427 53.8763 0.0219872V0H89.9457ZM0 74.7799V49.3572C6.77999 39.8903 10.8293 25.0091 10.6866 0H42.5338C42.9715 6.97682 43.1458 24.5886 32.7226 43.2406C21.955 62.5083 6.17623 71.6192 0 74.7799ZM0 107.597V95.6608C50.9824 86.7546 92.0424 49.6664 104.695 0H148.127C141.469 15.4405 128.26 40.2998 103.082 62.7968C62.7173 98.8614 17.3404 105.841 0 107.597ZM0.139963 120.692L0 120.696V109.348L0.139963 109.341C15.0227 108.547 29.4993 106.273 43.4134 102.67C84.5887 92.003 120.841 69.6901 148.132 39.6226V82.8631C129.632 92.8289 104.14 104.192 72.4324 111.856C44.4205 118.627 19.5812 120.571 0.139963 120.692ZM148.132 102.776V133.776H0V122.447C51.2376 122.434 101.006 115.324 148.132 102.776Z",o="underline decoration-edge-strong underline-offset-4 transition-[text-decoration-color] duration-200 ease-standard hover:decoration-fg",$={fromAttribute:g=>g!=="false"},m=class extends d{constructor(){super(...arguments);this.state="form";this.personalEmail=!1;this.teamSizes=["1-10","11-50","51-200","201-1,000","1,001+"];this.sending=!1;this.heading="Conare is invite-only";this.homeHref="";this.demoHref="";this.signInHref="";this.privacyHref="";this.supportEmail="support@acme.com";this.full=!0;this.answers={name:"",company:"",teamSize:"",useCase:""}}static{this.styles=[d.styles,x]}static{this.properties={state:{},email:{},personalEmail:{type:Boolean,attribute:"personal-email"},name:{},teamSizes:{type:Array,attribute:"team-sizes"},sending:{type:Boolean},error:{},heading:{},homeHref:{attribute:"home-href"},demoHref:{attribute:"demo-href"},signInHref:{attribute:"sign-in-href"},privacyHref:{attribute:"privacy-href"},supportEmail:{attribute:"support-email"},full:{converter:$},answers:{state:!0}}}willUpdate(e){super.willUpdate(e),e.has("name")&&this.name&&!this.answers.name&&(this.answers={...this.answers,name:this.name})}set(e){return n=>{this.answers={...this.answers,[e]:n.target.value}}}onSubmit(e){e.preventDefault(),this.emit("submit",{...this.answers})}render(){let e=r("button"),n=r("pixel-button"),a=r("field"),c=r("input"),u=r("native-select"),f=r("textarea"),p=this.answers,i=this.state;return t`<main data-ds="request-access-page" class=${["bg-surface px-4 py-12 text-fg md:py-24",this.full?"min-h-dvh":""].join(" ")}>
			<div class="mx-auto max-w-140">
				<a href=${this.homeHref} aria-label="Home" class="inline-block">
					<svg viewBox="0 0 149 134" class="h-8 w-auto" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d=${w}></path></svg>
				</a>
				<h1 class="mt-12 type-heading-3">${this.heading}</h1>
				<p class="mt-4 type-ui text-fg-muted">We set it up with each company directly. Tell us about your team and we'll reply by email, or <a href=${this.demoHref} class=${`text-fg ${o}`}>book a demo</a>.</p>

				${i==="loading"?t`<p class="ds-access-loading mt-8 type-ui text-fg-muted" role="status">Loading.</p>`:s}

				${i==="signed-out"?t`<section class="mt-8 border border-edge p-4 type-ui" data-state="signed-out">
							<p>Sign in with your work email first. We reply to that address, and it's the one your organization will use.</p>
							<div class="mt-6 flex flex-wrap items-center gap-4">
								${l`<${n} href=${this.signInHref}>Sign in</${n}>`}
								<a href=${`mailto:${this.supportEmail}`} class=${`type-meta ${o}`}>or write to ${this.supportEmail}</a>
							</div>
						</section>`:s}

				${i==="failed"?t`<section class="mt-8" data-state="failed">
							<p class="bg-surface-danger px-3 py-2 type-ui" role="alert">Something went wrong. Try again.</p>
							${l`<${e} class="mt-4" @click=${()=>this.emit("retry")}>Try again</${e}>`}
						</section>`:s}

				${i==="form"?l`<form class="mt-8 flex flex-col gap-6 border border-edge p-4" data-state="form" @submit=${this.onSubmit}>
							<div>
								<p class="type-meta text-fg-soft">Work email</p>
								<p class="mt-1.5 type-ui wrap-anywhere">${this.email}</p>
								${this.personalEmail?t`<p class="mt-2 type-meta text-fg-muted">This is a personal address. To ask for your company, <a href=${this.signInHref} class=${`text-fg ${o}`}>sign in with your work email</a>.</p>`:t`<a href=${this.signInHref} class=${`mt-2 inline-block type-meta ${o}`}>Use a different email</a>`}
							</div>
							<${a} label="Name">
								<${c} .value=${p.name} name="name" autocomplete="name" maxlength="200" required @input=${this.set("name")}></${c}>
							</${a}>
							<${a} label="Company">
								<${c} .value=${p.company} name="company" autocomplete="organization" maxlength="200" required @input=${this.set("company")}></${c}>
							</${a}>
							<${a} label="Team size">
								<${u} .value=${p.teamSize} name="team-size" required @input=${this.set("teamSize")}>
									<option value="" disabled>Choose</option>
									${this.teamSizes.map(h=>t`<option value=${h}>${h} people</option>`)}
								</${u}>
							</${a}>
							<${a} label="What you want to build">
								<${f} .value=${p.useCase} name="use-case" maxlength="4000" placeholder="For example: support agents that answer from our help center and past tickets." required @input=${this.set("useCase")}></${f}>
							</${a}>
							${this.error?t`<p class="bg-surface-danger px-3 py-2 type-ui" role="alert">${this.error}</p>`:s}
							<div class="flex flex-wrap items-center gap-4">
								<${n} type="submit" ?disabled=${this.sending}>${this.sending?"Sending":"Send request"}</${n}>
								<p class="type-meta text-fg-muted">We use these answers only to reply to you. <a href=${this.privacyHref} class=${`text-fg ${o}`}>Privacy policy</a>.</p>
							</div>
						</form>`:s}

				${i==="sent"?t`<section class="mt-8 border border-edge p-4 type-ui" data-state="sent" role="status">
							<h2 class="type-heading-4">We have your request.</h2>
							<p class="mt-2">We'll reply to <span class="wrap-anywhere">${this.email}</span>.</p>
							<p class="mt-8 type-meta text-fg-muted">What happens next</p>
							<ol class="mt-4 flex flex-col gap-3">
								<li class="flex gap-4"><span class="text-fg-muted tabular-nums">1</span><span>We read your request and reply by email.</span></li>
								<li class="flex gap-4"><span class="text-fg-muted tabular-nums">2</span><span>If it fits, we create an organization for your company and invite you to it.</span></li>
								<li class="flex gap-4"><span class="text-fg-muted tabular-nums">3</span><span>Open the invite and sign in with this email. The dashboard opens on get started.</span></li>
							</ol>
							<div class="mt-8 flex flex-wrap items-center gap-4">
								${l`<${e} href=${this.homeHref}>Back to the website</${e}>`}
								<button type="button" class=${`cursor-pointer type-meta ${o}`} @click=${()=>this.emit("edit")}>Change your answers</button>
							</div>
						</section>`:s}

				${i==="form"||i==="signed-out"?t`<p class="mt-6 type-meta text-fg-muted">Is your team already on it? Ask one of its admins to invite you.</p>`:s}
			</div>
		</main>`}};v("request-access-page",m);export{m as RequestAccessPage};
