let t=!1;const s="undefined"!=typeof window?window:{},i=s.document||{head:{}},n={t:0,i:"",jmp:t=>t(),raf:t=>requestAnimationFrame(t),ael:(t,s,i,n)=>t.addEventListener(s,i,n),rel:(t,s,i,n)=>t.removeEventListener(s,i,n),ce:(t,s)=>new CustomEvent(t,s)},e=t=>Promise.resolve(t),r=(t,s)=>{s&&!t.h&&s["s-p"]&&s["s-p"].push(new Promise((s=>t.h=s)))},h=t=>{if(!(4&t.t))return r(t,t.o),T((()=>o(t)));t.t|=512},o=t=>{const s=t.u;return f(void 0,(()=>a(t,s)))},a=async(t,s)=>{const i=t.l,n=i["s-rc"];c(t,s),n&&(n.map((t=>t())),i["s-rc"]=void 0);{const s=i["s-p"],n=()=>u(t);0===s.length?n():(Promise.all(s).then(n),t.t|=4,s.length=0)}},c=(t,s)=>{try{s=s.render(),t.t|=2}catch(s){y(s,t.l)}return null},u=t=>{const s=t.l,i=t.o;64&t.t||(t.t|=64,w(s),t.p(s),i||l()),t.h&&(t.h(),t.h=void 0),512&t.t&&C((()=>h(t))),t.t&=-517},l=()=>{w(i.documentElement),C((()=>(t=>{const s=n.ce("appload",{detail:{namespace:"app"}});return t.dispatchEvent(s),s})(s)))},f=(t,s)=>t&&t.then?t.then(s):s(),w=t=>t.classList.add("hydrated"),d=(t,e={})=>{const o=[],a=e.exclude||[],c=s.customElements,u=i.head,f=u.querySelector("meta[charset]"),w=i.createElement("style"),d=[];let p,g=!0;Object.assign(n,e),n.i=new URL(e.resourcesUrl||"./",i.baseURI).href,t.map((t=>t[1].map((s=>{const i={t:s[0],m:s[1],g:s[2],F:s[3]},e=i.m,u=class extends HTMLElement{constructor(t){super(t),m(t=this,i)}connectedCallback(){p&&(clearTimeout(p),p=null),g?d.push(this):n.jmp((()=>(t=>{if(0==(1&n.t)){const s=v(t),i=s.M,n=()=>{};if(!(1&s.t)){s.t|=1;{let i=t;for(;i=i.parentNode||i.host;)if(i["s-p"]){r(s,s.o=i);break}}(async(t,s,i,n,e)=>{if(0==(32&s.t)){if(s.t|=32,(e=x(i)).then){const t=()=>{};e=await e,t()}const t=()=>{};try{new e(s)}catch(t){y(t)}t()}const r=s.o,o=()=>h(s);r&&r["s-rc"]?r["s-rc"].push(o):o()})(0,s,i)}n()}})(this)))}disconnectedCallback(){n.jmp((()=>{}))}componentOnReady(){return v(this).$}};i.C=t[0],a.includes(e)||c.get(e)||(o.push(e),c.define(e,u))})))),w.innerHTML=o+"{visibility:hidden}.hydrated{visibility:inherit}",w.setAttribute("data-styles",""),u.insertBefore(w,f?f.nextSibling:u.firstChild),g=!1,d.length?d.map((t=>t.connectedCallback())):n.jmp((()=>p=setTimeout(l,30)))},p=new WeakMap,v=t=>p.get(t),m=(t,s)=>{const i={t:0,l:t,M:s,T:new Map};return i.$=new Promise((t=>i.p=t)),t["s-p"]=[],t["s-rc"]=[],p.set(t,i)},y=(t,s)=>(0,console.error)(t,s),g=new Map,x=t=>{const s=t.m.replace(/-/g,"_"),i=t.C,n=g.get(i);return n?n[s]:import(`./${i}.entry.js`).then((t=>(g.set(i,t),t[s])),y)},b=[],A=[],F=(s,i)=>e=>{s.push(e),t||(t=!0,i&&4&n.t?C($):n.raf($))},M=t=>{for(let s=0;s<t.length;s++)try{t[s](performance.now())}catch(t){y(t)}t.length=0},$=()=>{M(b),M(A),(t=b.length>0)&&n.raf($)},C=t=>e().then(t),T=F(A,!0);let E;const S=t=>{if(!E){if(t||(t=document.querySelector("canvas")),!t)return null;E=t.getContext("webgl2",{xrCompatible:!0}),E.enable(E.DEPTH_TEST),E.enable(E.CULL_FACE)}return E};class O{constructor(t){this.unit=-1,this.image=t,this.gl=S(),this.texture=this.gl.createTexture(),this.bindTexture();const s=this.gl;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,!0),s.texImage2D(s.TEXTURE_2D,0,s.RGBA,s.RGBA,s.UNSIGNED_BYTE,t),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MAG_FILTER,s.LINEAR),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,s.LINEAR_MIPMAP_LINEAR),s.generateMipmap(s.TEXTURE_2D)}bindTexture(t){void 0!==t&&(this.gl.activeTexture(this.gl.TEXTURE0+t),this.unit=t),this.gl.bindTexture(this.gl.TEXTURE_2D,this.texture)}unbindTexture(){this.gl.activeTexture(this.gl.TEXTURE0+this.unit),this.gl.bindTexture(this.gl.TEXTURE_2D,null)}uniform(t){this.gl.uniform1i(t,this.unit)}}class P{constructor(t,s,i){this.gl=S(),this.unit=-1,this.width=t,this.height=s;const n=this.gl;this.frameBuffer=n.createFramebuffer(),n.bindFramebuffer(n.FRAMEBUFFER,this.frameBuffer),this.texture=n.createTexture(),n.bindTexture(n.TEXTURE_2D,this.texture),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,t,s,0,n.RGBA,i||n.UNSIGNED_BYTE,null),n.generateMipmap(n.TEXTURE_2D),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),this.depth=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,this.depth),n.renderbufferStorage(n.RENDERBUFFER,n.DEPTH_COMPONENT16,t,s),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,this.texture,0),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.RENDERBUFFER,this.depth),n.bindTexture(n.TEXTURE_2D,null),n.bindRenderbuffer(n.RENDERBUFFER,null),n.bindFramebuffer(n.FRAMEBUFFER,null)}bind(){this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.frameBuffer),this.gl.viewport(0,0,this.width,this.height)}unbind(){this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null)}bindTexture(t){void 0!==t&&(this.gl.activeTexture(this.gl.TEXTURE0+t),this.unit=t),this.gl.bindTexture(this.gl.TEXTURE_2D,this.texture)}unbindTexture(){this.gl.activeTexture(this.gl.TEXTURE0+this.unit),this.gl.bindTexture(this.gl.TEXTURE_2D,null)}uniform(t){this.gl.uniform1i(t,this.unit)}}class L{constructor(){this.gl=S(),this.buffer=this.gl.createBuffer()}initBufferData(t,s){this.bind(),this.location=t,this.length=s.length,this.gl.bufferData(this.gl.ARRAY_BUFFER,s,this.gl.STATIC_DRAW),this.unbind()}bind(){this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.buffer),this.gl.vertexAttribPointer(this.location,3,this.gl.FLOAT,!1,0,0),this.gl.enableVertexAttribArray(this.location)}unbind(){this.gl.bindBuffer(this.gl.ARRAY_BUFFER,null)}}class R extends L{constructor(){super()}drawTriangles(){this.gl.drawArrays(this.gl.TRIANGLES,0,this.length/3)}}const k=(t,s)=>(s=>({uniform:i=>{t(i,s)},value:s}))(s),j=S(),N=t=>k((s=>{j.uniformMatrix4fv(s,!1,t)}),t),D=t=>k((s=>{j.uniform3fv(s,t)}),t),U=function(t){var s=new Float32Array(3);return t&&(s[0]=t[0],s[1]=t[1],s[2]=t[2]),s},I=function(t,s){return s||(s=t),s[0]=-t[0],s[1]=-t[1],s[2]=-t[2],s},V=function(t,s){s||(s=t);var i=t[0],n=t[1],e=t[2],r=Math.sqrt(i*i+n*n+e*e);return r?1==r?(s[0]=i,s[1]=n,s[2]=e,s):(s[0]=i*(r=1/r),s[1]=n*r,s[2]=e*r,s):(s[0]=0,s[1]=0,s[2]=0,s)},_=function(t){var s=new Float32Array(9);return t&&(s[0]=t[0],s[1]=t[1],s[2]=t[2],s[3]=t[3],s[4]=t[4],s[5]=t[5],s[6]=t[6],s[7]=t[7],s[8]=t[8]),s},W={create:function(t){var s=new Float32Array(16);return t&&(s[0]=t[0],s[1]=t[1],s[2]=t[2],s[3]=t[3],s[4]=t[4],s[5]=t[5],s[6]=t[6],s[7]=t[7],s[8]=t[8],s[9]=t[9],s[10]=t[10],s[11]=t[11],s[12]=t[12],s[13]=t[13],s[14]=t[14],s[15]=t[15]),s},set:function(t,s){return s[0]=t[0],s[1]=t[1],s[2]=t[2],s[3]=t[3],s[4]=t[4],s[5]=t[5],s[6]=t[6],s[7]=t[7],s[8]=t[8],s[9]=t[9],s[10]=t[10],s[11]=t[11],s[12]=t[12],s[13]=t[13],s[14]=t[14],s[15]=t[15],s},identity:function(t){return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=1,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=1,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t},transpose:function(t,s){if(!s||t==s){var i=t[1],n=t[2],e=t[3],r=t[6],h=t[7],o=t[11];return t[1]=t[4],t[2]=t[8],t[3]=t[12],t[4]=i,t[6]=t[9],t[7]=t[13],t[8]=n,t[9]=r,t[11]=t[14],t[12]=e,t[13]=h,t[14]=o,t}return s[0]=t[0],s[1]=t[4],s[2]=t[8],s[3]=t[12],s[4]=t[1],s[5]=t[5],s[6]=t[9],s[7]=t[13],s[8]=t[2],s[9]=t[6],s[10]=t[10],s[11]=t[14],s[12]=t[3],s[13]=t[7],s[14]=t[11],s[15]=t[15],s},determinant:function(t){var s=t[0],i=t[1],n=t[2],e=t[3],r=t[4],h=t[5],o=t[6],a=t[7],c=t[8],u=t[9],l=t[10],f=t[11],w=t[12],d=t[13],p=t[14],v=t[15];return w*u*o*e-c*d*o*e-w*h*l*e+r*d*l*e+c*h*p*e-r*u*p*e-w*u*n*a+c*d*n*a+w*i*l*a-s*d*l*a-c*i*p*a+s*u*p*a+w*h*n*f-r*d*n*f-w*i*o*f+s*d*o*f+r*i*p*f-s*h*p*f-c*h*n*v+r*u*n*v+c*i*o*v-s*u*o*v-r*i*l*v+s*h*l*v},inverse:function(t,s){s||(s=t);var i=t[0],n=t[1],e=t[2],r=t[3],h=t[4],o=t[5],a=t[6],c=t[7],u=t[8],l=t[9],f=t[10],w=t[11],d=t[12],p=t[13],v=t[14],m=t[15],y=i*o-n*h,g=i*a-e*h,x=i*c-r*h,b=n*a-e*o,A=n*c-r*o,F=e*c-r*a,M=u*p-l*d,$=u*v-f*d,C=u*m-w*d,T=l*v-f*p,E=l*m-w*p,S=f*m-w*v,O=1/(y*S-g*E+x*T+b*C-A*$+F*M);return s[0]=(o*S-a*E+c*T)*O,s[1]=(-n*S+e*E-r*T)*O,s[2]=(p*F-v*A+m*b)*O,s[3]=(-l*F+f*A-w*b)*O,s[4]=(-h*S+a*C-c*$)*O,s[5]=(i*S-e*C+r*$)*O,s[6]=(-d*F+v*x-m*g)*O,s[7]=(u*F-f*x+w*g)*O,s[8]=(h*E-o*C+c*M)*O,s[9]=(-i*E+n*C-r*M)*O,s[10]=(d*A-p*x+m*y)*O,s[11]=(-u*A+l*x-w*y)*O,s[12]=(-h*T+o*$-a*M)*O,s[13]=(i*T-n*$+e*M)*O,s[14]=(-d*b+p*g-v*y)*O,s[15]=(u*b-l*g+f*y)*O,s},toRotationMat:function(t,s){return s||(s=W.create()),s[0]=t[0],s[1]=t[1],s[2]=t[2],s[3]=t[3],s[4]=t[4],s[5]=t[5],s[6]=t[6],s[7]=t[7],s[8]=t[8],s[9]=t[9],s[10]=t[10],s[11]=t[11],s[12]=0,s[13]=0,s[14]=0,s[15]=1,s},toMat3:function(t,s){return s||(s=_()),s[0]=t[0],s[1]=t[1],s[2]=t[2],s[3]=t[4],s[4]=t[5],s[5]=t[6],s[6]=t[8],s[7]=t[9],s[8]=t[10],s},toInverseMat3:function(t,s){var i=t[0],n=t[1],e=t[2],r=t[4],h=t[5],o=t[6],a=t[8],c=t[9],u=t[10],l=u*h-o*c,f=-u*r+o*a,w=c*r-h*a,d=i*l+n*f+e*w;if(!d)return null;var p=1/d;return s||(s=_()),s[0]=l*p,s[1]=(-u*n+e*c)*p,s[2]=(o*n-e*h)*p,s[3]=f*p,s[4]=(u*i-e*a)*p,s[5]=(-o*i+e*r)*p,s[6]=w*p,s[7]=(-c*i+n*a)*p,s[8]=(h*i-n*r)*p,s},multiply:function(t,s,i){i||(i=t);var n=t[0],e=t[1],r=t[2],h=t[3],o=t[4],a=t[5],c=t[6],u=t[7],l=t[8],f=t[9],w=t[10],d=t[11],p=t[12],v=t[13],m=t[14],y=t[15],g=s[0],x=s[1],b=s[2],A=s[3],F=s[4],M=s[5],$=s[6],C=s[7],T=s[8],E=s[9],S=s[10],O=s[11],P=s[12],L=s[13],R=s[14],k=s[15];return i[0]=g*n+x*o+b*l+A*p,i[1]=g*e+x*a+b*f+A*v,i[2]=g*r+x*c+b*w+A*m,i[3]=g*h+x*u+b*d+A*y,i[4]=F*n+M*o+$*l+C*p,i[5]=F*e+M*a+$*f+C*v,i[6]=F*r+M*c+$*w+C*m,i[7]=F*h+M*u+$*d+C*y,i[8]=T*n+E*o+S*l+O*p,i[9]=T*e+E*a+S*f+O*v,i[10]=T*r+E*c+S*w+O*m,i[11]=T*h+E*u+S*d+O*y,i[12]=P*n+L*o+R*l+k*p,i[13]=P*e+L*a+R*f+k*v,i[14]=P*r+L*c+R*w+k*m,i[15]=P*h+L*u+R*d+k*y,i},multiplyVec3:function(t,s,i){i||(i=s);var n=s[0],e=s[1],r=s[2];return i[0]=t[0]*n+t[4]*e+t[8]*r+t[12],i[1]=t[1]*n+t[5]*e+t[9]*r+t[13],i[2]=t[2]*n+t[6]*e+t[10]*r+t[14],i},multiplyVec4:function(t,s,i){i||(i=s);var n=s[0],e=s[1],r=s[2],h=s[3];return i[0]=t[0]*n+t[4]*e+t[8]*r+t[12]*h,i[1]=t[1]*n+t[5]*e+t[9]*r+t[13]*h,i[2]=t[2]*n+t[6]*e+t[10]*r+t[14]*h,i[3]=t[3]*n+t[7]*e+t[11]*r+t[15]*h,i},translate:function(t,s,i){var n=s[0],e=s[1],r=s[2];if(!i||t==i)return t[12]=t[0]*n+t[4]*e+t[8]*r+t[12],t[13]=t[1]*n+t[5]*e+t[9]*r+t[13],t[14]=t[2]*n+t[6]*e+t[10]*r+t[14],t[15]=t[3]*n+t[7]*e+t[11]*r+t[15],t;var h=t[0],o=t[1],a=t[2],c=t[3],u=t[4],l=t[5],f=t[6],w=t[7],d=t[8],p=t[9],v=t[10],m=t[11];return i[0]=h,i[1]=o,i[2]=a,i[3]=c,i[4]=u,i[5]=l,i[6]=f,i[7]=w,i[8]=d,i[9]=p,i[10]=v,i[11]=m,i[12]=h*n+u*e+d*r+t[12],i[13]=o*n+l*e+p*r+t[13],i[14]=a*n+f*e+v*r+t[14],i[15]=c*n+w*e+m*r+t[15],i},scale:function(t,s,i){var n=s[0],e=s[1],r=s[2];return i&&t!=i?(i[0]=t[0]*n,i[1]=t[1]*n,i[2]=t[2]*n,i[3]=t[3]*n,i[4]=t[4]*e,i[5]=t[5]*e,i[6]=t[6]*e,i[7]=t[7]*e,i[8]=t[8]*r,i[9]=t[9]*r,i[10]=t[10]*r,i[11]=t[11]*r,i[12]=t[12],i[13]=t[13],i[14]=t[14],i[15]=t[15],i):(t[0]*=n,t[1]*=n,t[2]*=n,t[3]*=n,t[4]*=e,t[5]*=e,t[6]*=e,t[7]*=e,t[8]*=r,t[9]*=r,t[10]*=r,t[11]*=r,t)},rotate:function(t,s,i,n){var e=i[0],r=i[1],h=i[2],o=Math.sqrt(e*e+r*r+h*h);if(!o)return null;1!=o&&(e*=o=1/o,r*=o,h*=o);var a=Math.sin(s),c=Math.cos(s),u=1-c,l=t[0],f=t[1],w=t[2],d=t[3],p=t[4],v=t[5],m=t[6],y=t[7],g=t[8],x=t[9],b=t[10],A=t[11],F=e*e*u+c,M=r*e*u+h*a,$=h*e*u-r*a,C=e*r*u-h*a,T=r*r*u+c,E=h*r*u+e*a,S=e*h*u+r*a,O=r*h*u-e*a,P=h*h*u+c;return n?t!=n&&(n[12]=t[12],n[13]=t[13],n[14]=t[14],n[15]=t[15]):n=t,n[0]=l*F+p*M+g*$,n[1]=f*F+v*M+x*$,n[2]=w*F+m*M+b*$,n[3]=d*F+y*M+A*$,n[4]=l*C+p*T+g*E,n[5]=f*C+v*T+x*E,n[6]=w*C+m*T+b*E,n[7]=d*C+y*T+A*E,n[8]=l*S+p*O+g*P,n[9]=f*S+v*O+x*P,n[10]=w*S+m*O+b*P,n[11]=d*S+y*O+A*P,n},rotateX:function(t,s,i){var n=Math.sin(s),e=Math.cos(s),r=t[4],h=t[5],o=t[6],a=t[7],c=t[8],u=t[9],l=t[10],f=t[11];return i?t!=i&&(i[0]=t[0],i[1]=t[1],i[2]=t[2],i[3]=t[3],i[12]=t[12],i[13]=t[13],i[14]=t[14],i[15]=t[15]):i=t,i[4]=r*e+c*n,i[5]=h*e+u*n,i[6]=o*e+l*n,i[7]=a*e+f*n,i[8]=r*-n+c*e,i[9]=h*-n+u*e,i[10]=o*-n+l*e,i[11]=a*-n+f*e,i},rotateY:function(t,s,i){var n=Math.sin(s),e=Math.cos(s),r=t[0],h=t[1],o=t[2],a=t[3],c=t[8],u=t[9],l=t[10],f=t[11];return i?t!=i&&(i[4]=t[4],i[5]=t[5],i[6]=t[6],i[7]=t[7],i[12]=t[12],i[13]=t[13],i[14]=t[14],i[15]=t[15]):i=t,i[0]=r*e+c*-n,i[1]=h*e+u*-n,i[2]=o*e+l*-n,i[3]=a*e+f*-n,i[8]=r*n+c*e,i[9]=h*n+u*e,i[10]=o*n+l*e,i[11]=a*n+f*e,i},rotateZ:function(t,s,i){var n=Math.sin(s),e=Math.cos(s),r=t[0],h=t[1],o=t[2],a=t[3],c=t[4],u=t[5],l=t[6],f=t[7];return i?t!=i&&(i[8]=t[8],i[9]=t[9],i[10]=t[10],i[11]=t[11],i[12]=t[12],i[13]=t[13],i[14]=t[14],i[15]=t[15]):i=t,i[0]=r*e+c*n,i[1]=h*e+u*n,i[2]=o*e+l*n,i[3]=a*e+f*n,i[4]=r*-n+c*e,i[5]=h*-n+u*e,i[6]=o*-n+l*e,i[7]=a*-n+f*e,i},frustum:function(t,s,i,n,e,r,h){h||(h=W.create());var o=s-t,a=n-i,c=r-e;return h[0]=2*e/o,h[1]=0,h[2]=0,h[3]=0,h[4]=0,h[5]=2*e/a,h[6]=0,h[7]=0,h[8]=(s+t)/o,h[9]=(n+i)/a,h[10]=-(r+e)/c,h[11]=-1,h[12]=0,h[13]=0,h[14]=-r*e*2/c,h[15]=0,h},perspective:function(t,s,i,n,e){var r=i*Math.tan(t*Math.PI/360),h=r*s;return W.frustum(-h,h,-r,r,i,n,e)},ortho:function(t,s,i,n,e,r,h){h||(h=W.create());var o=s-t,a=n-i,c=r-e;return h[0]=2/o,h[1]=0,h[2]=0,h[3]=0,h[4]=0,h[5]=2/a,h[6]=0,h[7]=0,h[8]=0,h[9]=0,h[10]=-2/c,h[11]=0,h[12]=-(t+s)/o,h[13]=-(n+i)/a,h[14]=-(r+e)/c,h[15]=1,h},lookAt:function(t,s,i,n){n||(n=W.create());var e,r,h,o,a,c,u,l,f,w,d=t[0],p=t[1],v=t[2],m=i[0],y=i[1],g=i[2];return d==s[0]&&p==s[1]&&v==s[2]?W.identity(n):(h=v-s[2],(w=Math.sqrt((o=y*(h*=w=1/Math.sqrt((e=d-s[0])*e+(r=p-s[1])*r+h*h))-g*(r*=w))*o+(a=g*(e*=w)-m*h)*a+(c=m*r-y*e)*c))?(o*=w=1/w,a*=w,c*=w):(o=0,a=0,c=0),(w=Math.sqrt((u=r*c-h*a)*u+(l=h*o-e*c)*l+(f=e*a-r*o)*f))?(u*=w=1/w,l*=w,f*=w):(u=0,l=0,f=0),n[0]=o,n[1]=u,n[2]=e,n[3]=0,n[4]=a,n[5]=l,n[6]=r,n[7]=0,n[8]=c,n[9]=f,n[10]=h,n[11]=0,n[12]=-(o*d+a*p+c*v),n[13]=-(u*d+l*p+f*v),n[14]=-(e*d+r*p+h*v),n[15]=1,n)},str:function(t){return"["+t[0]+", "+t[1]+", "+t[2]+", "+t[3]+", "+t[4]+", "+t[5]+", "+t[6]+", "+t[7]+", "+t[8]+", "+t[9]+", "+t[10]+", "+t[11]+", "+t[12]+", "+t[13]+", "+t[14]+", "+t[15]+"]"}};let B=window.XRWebGLLayer;class H{constructor(t,s){this.webXRSession=t,this.gl=s,this.init()}async init(){this.baseLayer=new B(this.webXRSession,this.gl),this.webXRSession.updateRenderState({baseLayer:this.baseLayer}),this.XRReferenceSpace=await this.webXRSession.requestReferenceSpace("local")}bind(){const t=this.gl;t.bindFramebuffer(t.FRAMEBUFFER,this.baseLayer.framebuffer)}unbind(){const t=this.gl;t.bindFramebuffer(t.FRAMEBUFFER,null)}}class K{constructor(t=[]){this.children=[],this.children=t}visit(t,s){this.enter(t,s);for(let i=0;i<this.children.length;i++)this.children[i].visit(t,s);this.exit(t,s)}exit(t,s){}append(t){this.children.push(t)}enter(t,s){}}class G{constructor(t){this.uniforms={},this.shaders=[],this.viewport={x:0,y:0,width:640,height:480},this.textureUnit=0,this.gl=S(),this.attempWebXRInit(t),this.root=new K}attempWebXRInit(t){t&&(this.webXr=new H(t,this.gl))}draw(t){const s=this.gl;if(s.clearColor(0,0,0,1),s.clearDepth(1),s.clear(s.COLOR_BUFFER_BIT|s.DEPTH_BUFFER_BIT),t){const i=t.getViewerPose(this.webXr.XRReferenceSpace);let n=t.session.renderState.baseLayer;for(let e of i.views){let i=n.getViewport(e);this.viewport={x:i.x,y:i.y,width:i.width,height:i.height},s.viewport(i.x,i.y,i.width,i.height),this.setCurrentView(e),this.root.visit(this,t)}}else this.root.visit(this,t)}pushUniforms(){this.uniforms=Object.create(this.uniforms)}popUniforms(){this.uniforms=Object.getPrototypeOf(this.uniforms)}pushTextura(){return this.textureUnit++}popTextura(){this.textureUnit--}getWebXR(){return this.webXr}setCamera(t){this.camera=t}getCamera(){return this.camera}setCurrentView(t){this.view=t}getCurrentView(){return this.view}pushShader(t){this.shaders.push(t)}popShader(){this.shaders.pop()}getShader(){return this.shaders[this.shaders.length-1]}}class X extends K{constructor(t,s){super(),this.children=[],this.fbo=t,this.children=s}enter(t){this.fbo.bind(),t.gl.clear(t.gl.COLOR_BUFFER_BIT|t.gl.DEPTH_BUFFER_BIT)}exit(t){this.fbo.unbind(),t.gl.viewport(t.viewport.x,t.viewport.y,t.viewport.width,t.viewport.height)}}class z extends K{constructor(t,s,i){super(),this.children=[],this.shader=t,this.uniforms=s,this.children=i}enter(t){t.pushShader(this.shader),this.shader.use(),tt.prototype.enter.call(this,t)}exit(t){t.popShader(),tt.prototype.exit.call(this,t)}}class q extends K{constructor(t){super(),this.children=[],this.x=0,this.y=0,this.near=.5,this.far=5e3,this.fov=50,this.children=t,this.gl=S(),this.position=U([0,0,0])}enter(t,s){t.pushUniforms(),s&&(this.view=t.getCurrentView());const i=this.getMergePosition(),n=this.getProjection(t),e=this.getWorldView(),r=W.create();W.multiply(n,e,r),t.uniforms.projection=N(r),t.uniforms.eye=D(i)}exit(t){t.popUniforms()}getMergePosition(){return this.view?new Float32Array([30*this.view.transform.position.x+this.position[0],30*this.view.transform.position.y+this.position[1],30*this.view.transform.position.z+this.position[2]]):new Float32Array(this.position)}project(t,s){const i=W.create();W.multiply(this.getProjection(s),this.getWorldView(),i);const n=W.multiplyVec4(i,t,function(t,s){var i=new Float32Array(4);return t&&(i[0]=t[0],i[1]=t[1],i[2]=t[2],i[3]=t.length>3?t[3]:s),i}());return function(t,s,i){i&&t!=i?(i[0]=t[0]*s,i[1]=t[1]*s,i[2]=t[2]*s,i[3]=t[3]*s):(t[0]*=s,t[1]*=s,t[2]*=s,t[3]*=s)}(n,1/n[3]),n}getInverseRotation(){return function(t,s){return s||(s=W.create()),s[0]=t[0],s[1]=t[1],s[2]=t[2],s[3]=0,s[4]=t[3],s[5]=t[4],s[6]=t[5],s[7]=0,s[8]=t[6],s[9]=t[7],s[10]=t[8],s[11]=0,s[12]=0,s[13]=0,s[14]=0,s[15]=1,s}(W.toInverseMat3(this.view?this.view.transform.matrix:this.getWorldView()))}getProjection(t){return this.view?this.view.projectionMatrix:W.perspective(this.fov,t.viewport.width/t.viewport.height,this.near,this.far)}getWorldView(){const t=this.getMergePosition();if(this.view)return W.translate(this.view.transform.inverse.matrix,I(t,U())),this.view.transform.inverse.matrix;const s=W.identity(W.create());return W.rotateX(s,this.x),W.rotateY(s,this.y),W.translate(s,I(t,U())),s}}class Y extends K{constructor(){super()}visit(t){const s=t.getShader();s.uniforms(t.uniforms);const i=s.attributes;for(const t of Object.keys(i)){const s=i[t];s.bind(),s instanceof R&&s.drawTriangles()}for(const t of Object.keys(i))i[t].unbind()}}class Z extends K{constructor(t){super(),this.children=[],this.wordMatrix=W.create(),this.aux=W.create(),this.children=t,W.identity(this.wordMatrix)}enter(t){t.pushUniforms(),t.uniforms.modelTransform?(W.multiply(t.uniforms.modelTransform.value,this.wordMatrix,this.aux),t.uniforms.modelTransform=N(this.aux)):t.uniforms.modelTransform=N(this.wordMatrix)}exit(t){t.popUniforms()}}class J extends Z{constructor(t){super(t)}enter(t){t.gl.cullFace(t.gl.FRONT),super.enter.call(this,t)}exit(t){t.gl.cullFace(t.gl.BACK),super.exit.call(this,t)}}class Q extends Z{constructor(t){super(t),this.wordMatrix=W.create(),this.children=t}enter(t){t.pushUniforms();const s=W.create();W.multiply(t.getCamera().getInverseRotation(),this.wordMatrix,s),t.uniforms.modelTransform=N(s)}exit(t){t.popUniforms()}}class tt extends K{constructor(t,s){super(),this.uniforms=t,this.children=s}enter(t){t.pushUniforms();for(let s in this.uniforms){const i=this.uniforms[s];(i instanceof O||i instanceof P)&&i.bindTexture(t.pushTextura()),t.uniforms[s]=i}}exit(t){for(let s in this.uniforms){const i=this.uniforms[s];(i instanceof O||i instanceof P)&&(i.unbindTexture(),t.popTextura())}t.popUniforms()}}class st extends K{enter(t,s){s&&t.getWebXR().bind()}exit(t,s){s&&t.getWebXR().unbind()}}class it extends K{constructor(t,s){super(),t.setAttribBufferData("position",new Float32Array([1,1,1,1,-1,1,-1,-1,1,1,1,1,-1,-1,1,-1,1,1,-1,1,-1,-1,-1,-1,1,1,-1,1,1,-1,-1,-1,-1,1,-1,-1,-1,1,1,-1,-1,-1,-1,1,-1,-1,1,1,-1,-1,1,-1,-1,-1,1,1,1,1,1,-1,1,-1,-1,1,1,1,1,-1,-1,1,-1,1,1,1,1,-1,1,1,-1,1,-1,1,1,-1,1,1,1,-1,1,-1,-1,-1,-1,-1,-1,1,1,-1,1,-1,-1,-1,1,-1,1,1,-1,-1]));const i=new Y,n=new z(t,s,[i]);this.children=[n]}}const nt=(t,s,i)=>{const n=t.createShader(s);if(t.shaderSource(n,i),t.compileShader(n),!t.getShaderParameter(n,t.COMPILE_STATUS))throw console.warn(t.getShaderInfoLog(n),s,i),'Compiler exception: "'+t.getShaderInfoLog(n)+'"';return n};class et{constructor(t,s){this.attributes={},this.uniformLocations={},this.gl=S(),this.program=((t,s,i)=>{const n=nt(t,t.VERTEX_SHADER,s),e=nt(t,t.FRAGMENT_SHADER,i),r=t.createProgram();if(t.attachShader(r,n),t.attachShader(r,e),t.linkProgram(r),!t.getProgramParameter(r,t.LINK_STATUS))throw"Linker exception: "+t.getProgramInfoLog(r);return r})(this.gl,t,s)}use(){this.gl.useProgram(this.program)}uniforms(t){for(let s in t){const i=t[s];let n;void 0!==this.uniformLocations[s]?n=this.uniformLocations[s]:(n=this.gl.getUniformLocation(this.program,s),this.uniformLocations[s]=n),null!==n&&("number"==typeof i?this.gl.uniform1f(n,i):i.uniform(n))}}setAttribBufferData(t,s){this.use();const i="position"==t?new R:new L;this.attributes[t]=i;const n=this.getAttribLocation(t);i.initBufferData(n,s)}getAttribLocation(t){const s=this.gl.getAttribLocation(this.program,t);if(s<0)throw"attribute not found";return s}}class rt{constructor(t){this.shaders={},this.prefix="shaders/",this.importExpression=/\/\/\/\s*import "([^"]+)"/g,this.gl=S(),this.resources=t}get(t,s){s||(s=t+".frag",t+=".vertex");const i=`${t}-${s}`;return i in this.resources||(this.shaders[i]=new et(this.getSource(t),this.getSource(s))),this.shaders[i]}getSource(t){const s=this._getSourceName(t),i=this.resources[this.prefix+s];if(null==i)throw Error(`cant found ${t} Source`);return i.replace(this.importExpression,((t,s)=>this.getSource(s)))}_getSourceName(t){const s=t.split("/");return s[s.length-1]}}class ht{constructor(t){this.resources={},this.pendingStatus={total:0,pending:0,failed:0},this.loadImage=t=>{const s=document.createElement("img");s.src=this.rootPath+t,s.onload=()=>{this.success(t,s)},s.onerror=()=>{this.error(t,s)}},this.loadJSON=t=>{fetch(this.rootPath+t).then((async t=>t.json())).then((s=>this.success(t,s))).catch((s=>{this.error(t,s)}))},this.loadData=t=>{fetch(this.rootPath+t).then((async t=>t.text())).then((s=>{this.success(t,s)})).catch((s=>{this.error(t,s)}))},this.success=(t,s)=>{this.resources[t]=s,this.pendingStatus.pending--,0===this.pendingStatus.pending&&this.onRendy&&this.onRendy()},this.error=(t,s)=>{throw this.pendingStatus.pending--,this.pendingStatus.failed++,this.resources[t]=null,"string"!=typeof s&&(s.path=t),s},this.rootPath=t}load(t){for(let s=0;s<t.length;s++){const i=t[s];i in t||(this.pendingStatus.pending++,this.pendingStatus.total++,/\.(jpe?g|gif|png)$/.test(i)?this.loadImage(i):/\.json$/.test(i)?this.loadJSON(i):this.loadData(i))}setTimeout((()=>{0===this.pendingStatus.pending&&this.onRendy&&this.onRendy()}),1)}setOnRendy(t){this.onRendy=t}}const ot=t=>{const s=new Float32Array(t*t*6*3);let i=0;for(var n=0;n<t;n++)for(var e=0;e<t;e++)s[i++]=e/t,s[i++]=0,s[i++]=n/t,s[i++]=e/t,s[i++]=0,s[i++]=(n+1)/t,s[i++]=(e+1)/t,s[i++]=0,s[i++]=(n+1)/t,s[i++]=e/t,s[i++]=0,s[i++]=n/t,s[i++]=(e+1)/t,s[i++]=0,s[i++]=(n+1)/t,s[i++]=(e+1)/t,s[i++]=0,s[i++]=n/t;return s};class at{constructor(t,s){this.input=t,this.camera=s}tick(){const{x:t,y:s}=this.input.getOffsetFromElementCenter();this.camera.y+=8e-5*t,this.camera.x+=8e-5*s;const i=this.camera.getInverseRotation(),n=U();this.input.keys.W?n[2]=-1:this.input.keys.S&&(n[2]=1),this.input.keys.A?n[0]=-1:this.input.keys.D&&(n[0]=1),V(n),W.multiplyVec3(i,n),function(t,s,i){i&&t!=i?(i[0]=t[0]+s[0],i[1]=t[1]+s[1],i[2]=t[2]+s[2]):(t[0]+=s[0],t[1]+=s[1],t[2]+=s[2])}(this.camera.position,n)}}const ct={32:"SPACE",13:"ENTER",9:"TAB",8:"BACKSPACE",16:"SHIFT",17:"CTRL",18:"ALT",20:"CAPS_LOCK",144:"NUM_LOCK",145:"SCROLL_LOCK",37:"LEFT",38:"UP",39:"RIGHT",40:"DOWN",33:"PAGE_UP",34:"PAGE_DOWN",36:"HOME",35:"END",45:"INSERT",46:"DELETE",27:"ESCAPE",19:"PAUSE"},ut=(t,s,i)=>t<s?s:t>i?i:t,lt=t=>{if(t){const s=t.changedTouches;if(s&&s.length>0){const t=s[0];return{x:t.clientX,y:t.clientY}}if(void 0!==t.pageX)return{x:t.pageX,y:t.pageY}}return{x:0,y:0}};class ft{constructor(t){this.keys={},this.offset={x:0,y:0},this.mouse={down:!1,x:0,y:0},this.onClick=void 0,this.onKeyUp=void 0,this.onKeyDown=void 0,this.width=0,this.height=0,this.hasFocus=!0,this.element=void 0,this.focus=()=>{this.hasFocus||(this.hasFocus=!0,this.reset())},this.blur=()=>{this.hasFocus=!1,this.reset()},this.mouseMove=(t,s)=>{this.mouse.down&&(this.mouse.x=ut(t-this.offset.x,0,this.element.width),this.mouse.y=ut(s-this.offset.y,0,this.element.height))},this.mouseDown=(t,s)=>{this.mouse.down=!0,this.mouse.x=ut(t-this.offset.x,0,this.element.width),this.mouse.y=ut(s-this.offset.y,0,this.element.height)},this.mouseUp=()=>{this.mouse.down=!1,this.hasFocus&&this.onClick&&this.onClick(this.mouse.x,this.mouse.y)},this.keyDown=t=>{const s=this.getKeyName(t),i=this.keys[s];return this.keys[s]=!0,this.onKeyDown&&!i&&this.onKeyDown(s),this.hasFocus},this.keyUp=t=>{var s=this.getKeyName(t);return this.keys[s]=!1,this.onKeyUp&&this.onKeyUp(s),this.hasFocus},this.reset=()=>{this.keys={};for(let t=65;t<128;t++)this.keys[String.fromCharCode(t)]=!1;for(let t in ct)this.keys[ct[t]]=!1;this.mouse={down:!1,x:0,y:0}},this.getKeyName=t=>ct[t]||String.fromCharCode(t),this.element=t,this.bind(t),this.reset()}bind(t){if(!t)return;this.element=t;const s=t.getBoundingClientRect();this.offset={x:s.left,y:s.top},document.onkeydown=t=>this.keyDown(t.keyCode),document.onkeyup=t=>this.keyUp(t.keyCode),window.onclick=s=>{s.target===t?focus():blur()},this.element.onmousedown=t=>{const{x:s,y:i}=lt(t);this.mouseDown(s,i)},this.element.ontouchstart=t=>{const{x:s,y:i}=lt(t);this.mouseDown(s,i)},document.ontouchmove=t=>{const{x:s,y:i}=lt(t);this.mouseMove(s,i)},document.onmousemove=t=>{const{x:s,y:i}=lt(t);this.mouseMove(s,i)},document.ontouchend=this.mouseUp,document.ontouchcancel=this.mouseUp,document.onmouseup=this.mouseUp}getOffsetFromElementCenter(){return this.element&&this.mouse.down?{x:this.mouse.x-.5*this.element.width,y:this.mouse.y-.5*this.element.height}:{x:0,y:0}}}let wt=window.navigator;const dt=new URLSearchParams(location.search),pt=parseFloat(dt.get("d"))||1,vt=512*pt*pt,mt=async()=>{const t=document.querySelector("canvas"),s=new ft(t),i=(t=>{let s,i,n=!1,e=null;return{start:async t=>{if(n)return;let r;n=!0,s=(new Date).getTime();const h=(t,e)=>{n&&(((t,n)=>{const e=s;s=(new Date).getTime(),i&&i((s-e)/1e3,n)})(0,e),r(h))};r=t?t.requestAnimationFrame.bind(t):window.requestAnimationFrame||(t=>{e=setTimeout(t,16)}),r(h)},stop:()=>{n=!1,e&&(clearInterval(e),e=null),t&&(t.end(),t=void 0)},setOnTick:t=>{i=t}}})(),n=new ht("./assets/");let e,r;n.load(["shaders/sun.glsl","shaders/transform.glsl","shaders/water.vert","shaders/water.frag","heightmap.png","normalnoise.png","snow.png","occlusion.png","shaders/terrain.vert","shaders/terrain.frag","shaders/screen.vert","shaders/screen.frag","shaders/sky.vert","shaders/sky.frag","shaders/plane.vert","shaders/plane.frag","obj/seahawk.obj"]);const h=S(),o={sunColor:D([1.1,1,1]),sunDirection:D(V(new Float32Array([0,.6,-1]))),skyColor:D([.1,.15,.45]),clip:1e3,time:0};n.setOnRendy((async()=>{i.setOnTick(((t,s)=>{o.time+=t,e.tick(),r.draw(s)}));const a=a=>{i.stop(),(i=>{r=new G(i),h.clearColor(1,1,1,512);const a=new rt(n.resources),c=new O(n.resources["heightmap.png"]),u=new O(n.resources["normalnoise.png"]),l=new O(n.resources["snow.png"]),f=new O(n.resources["occlusion.png"]),{position:w,normal:d}=(t=>{const s=[[0,0,0]],i=[[0,0]],n=[[0,0,0]],e=[s,i,n];let r=[[],[],[]];function h(t){t.split("/").forEach(((t,s)=>{if(!t)return;const i=parseInt(t);r[s].push(...e[s][i+(i>=0?0:e[s].length)])}))}const o={v(t){s.push(t.map(parseFloat))},vn(t){n.push(t.map(parseFloat))},vt(t){i.push(t.map(parseFloat))},f(t){const s=t.length-2;for(let i=0;i<s;++i)h(t[0]),h(t[i+1]),h(t[i+2])}},a=/(\w*)(?: )*(.*)/,c=t.split("\n");for(let t=0;t<c.length;++t){const s=c[t].trim();if(""===s||s.startsWith("#"))continue;const i=a.exec(s);if(!i)continue;const[,n,e]=i,r=s.split(/\s+/).slice(1),h=o[n];h&&h(r,e)}return{position:r[0],texcoord:r[1],normal:r[2]}})(n.resources["obj/seahawk.obj"]),p=a.get("terrain.vert","terrain.frag"),v=a.get("water.vert","water.frag"),m=a.get("sky.vert","sky.frag"),y=a.get("plane.vert","plane.frag");p.setAttribBufferData("position",ot(vt)),v.setAttribBufferData("position",ot(100)),y.setAttribBufferData("position",new Float32Array(w)),y.setAttribBufferData("vNormal",new Float32Array(d));const g=W.identity(W.create());W.rotateY(g,Math.PI);const x=new Float32Array([0,-2,8]);W.translate(g,x),W.scale(g,new Float32Array([.01,.01,.01]));const b=new Z([new Y]),A=new Z([new Y]),F=new Q([new Y]),M=new z(y,{color:D([.2,.2,.7])},[F]),$=new z(p,{heightmap:c,snowTexture:l,occlusionmap:f,snowColor:D([.9,.9,.9]),groundColor:D([.5,.5,.5])},[b]),C=new Z([new it(m,{horizonColor:D([.3,.6,1.2])})]),T=new J([$,C]),E=new P(1024*pt,512*pt),S=new P(1024*pt,1024*pt),L=new X(E,[new tt({clip:0},[$])]),R=new X(S,[new tt({clip:0},[T])]),k=new K([R,L]),j=new z(v,{color:D([.7,.7,.9]),waterNoise:u,reflection:S,refraction:E},[A]),N=new st([M,$,j,C]),U=new q([new tt(o,[k,N])]);e=new at(s,U),r.setCamera(U),r.root.append(U),U.position=new Float32Array([0,10,200]),U.far=1024,W.translate(b.wordMatrix,new Float32Array([-256,-40,-256])),W.scale(b.wordMatrix,new Float32Array([512,100,512])),W.scale(T.wordMatrix,new Float32Array([1,-1,1])),W.translate(A.wordMatrix,new Float32Array([-256,0,-256])),W.scale(A.wordMatrix,new Float32Array([512,1,512])),W.scale(C.wordMatrix,new Float32Array([512,512,512])),F.wordMatrix=g,U.far=1024,((t,s)=>{const i=()=>{t.width=s.viewport.width=window.innerWidth,t.height=s.viewport.height=window.innerHeight,s.draw()};window.addEventListener("resize",i,!1),i()})(t,r)})(a),i.start(a)},c=document.querySelector("button");let u=!1;wt.xr&&await wt.xr.isSessionSupported("immersive-vr")&&(c.innerHTML="ENTER VR",c.disabled=!1,u=!0),c.onclick=()=>{u?(h.makeXRCompatible(),wt.xr.requestSession("immersive-vr").then((t=>{a(t)}))):a()}}))};export{d as b,mt as g,e as p}