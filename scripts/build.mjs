import {readdir,mkdir,copyFile,readFile,writeFile,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const out=path.join(root,'dist');
const files=(await readdir(root)).filter(f=>/\.(html|css|js|svg|txt)$/.test(f));
let origin;
if(process.env.SITE_URL){origin=new URL(process.env.SITE_URL);if(!['https:','http:'].includes(origin.protocol)||origin.pathname!=='/'||origin.search||origin.hash||origin.username||origin.password)throw new Error('SITE_URL must be an origin without a path.');}
await mkdir(out,{recursive:true});
for(const f of files)await copyFile(path.join(root,f),path.join(out,f));
const pages=files.filter(f=>f.endsWith('.html')&&f!=='404.html');
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
if(origin){
for(const f of pages){
  const url=new URL(f==='index.html'?'/':f,origin).href;
  let html=await readFile(path.join(out,f),'utf8');
  const decode=s=>s.replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
  const title=decode(html.match(/<title>(.*?)<\/title>/s)[1].replace(/ — Numberlune$/,''));
  const organization={'@type':'Organization','@id':new URL('/#organization',origin).href,name:'Numberlune',url:origin.href};
  const website={'@type':'WebSite','@id':new URL('/#website',origin).href,name:'Numberlune',url:origin.href,inLanguage:'en',publisher:{'@id':organization['@id']}};
  const webpage={'@type':'WebPage','@id':url+'#webpage',url,name:title,inLanguage:'en',isPartOf:{'@id':website['@id']},publisher:{'@id':organization['@id']}};
  const graph=[organization,website,webpage];
  html=html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(_,raw)=>{
    const data=JSON.parse(raw),items=data['@graph']||[data];
    for(const item of items){
      delete item['@context'];
      if(item['@type']==='Article'){
        item['@id']=url+'#article';item.mainEntityOfPage={'@id':webpage['@id']};
        item.author={'@id':organization['@id']};item.publisher={'@id':organization['@id']};
      }
      if(item['@type']==='WebApplication'){item['@id']=url+'#calculator';item.url=url+'#reading';item.publisher={'@id':organization['@id']};}
      graph.push(item);
    }
    return '';
  });
  if(f!=='index.html'){
    const label=decode(html.match(/class="breadcrumbs"[\s\S]*?<span>\/<\/span><span>(.*?)<\/span>/)?.[1]||title);
    const breadcrumb={'@type':'BreadcrumbList','@id':url+'#breadcrumbs',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:origin.href},{'@type':'ListItem',position:2,name:label,item:url}]};
    webpage.breadcrumb={'@id':breadcrumb['@id']};graph.push(breadcrumb);
  }
  const json=JSON.stringify({'@context':'https://schema.org','@graph':graph}).replaceAll('<','\\u003c');
  html=html.replace('</head>',`<link rel="canonical" href="${esc(url)}"><meta property="og:url" content="${esc(url)}"><script type="application/ld+json">${json}</script></head>`);
  await writeFile(path.join(out,f),html);
}
await writeFile(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(f=>`<url><loc>${esc(new URL(f==='index.html'?'/':f,origin).href)}</loc></url>`).join('')}</urlset>`);
await writeFile(path.join(out,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml',origin).href}\n`);
const llms=await readFile(path.join(out,'llms.txt'),'utf8');
await writeFile(path.join(out,'llms.txt'),llms.replace(/\]\(\.\/([^)]*)\)/g,(_,file)=>`](${new URL(file,origin).href})`));
}else await rm(path.join(out,'sitemap.xml'),{force:true});
console.log(`Built ${files.length} assets${origin?' with sitemap and canonical URLs':''}.`);
