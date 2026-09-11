import fs from 'node:fs';import path from 'node:path';import {parse} from '@babel/parser';import traverseModule from '@babel/traverse';import generateModule from '@babel/generator';import * as t from '@babel/types';
const traverse=traverseModule.default||traverseModule,generate=generateModule.default||generateModule;
const root=path.resolve('src');const files=[];function walk(p){for(const e of fs.readdirSync(p,{withFileTypes:true}))e.isDirectory()?walk(path.join(p,e.name)):e.name.endsWith('.mjs')&&files.push(path.join(p,e.name));}walk(root);
// Repair implicit cross-file globals previously hidden by string-concatenating the build.
const exports=new Map();for(const file of files){const ast=parse(fs.readFileSync(file,'utf8'),{sourceType:'module'});for(const n of ast.program.body)if(t.isExportNamedDeclaration(n)&&n.declaration){const d=n.declaration;const names=t.isVariableDeclaration(d)?d.declarations.flatMap(x=>Object.keys(t.getBindingIdentifiers(x.id))):d.id?[d.id.name]:[];for(const name of names)exports.set(name,file);}}
for(const file of files){let source=fs.readFileSync(file,'utf8'),ast=parse(source,{sourceType:'module'});const missing=new Map();traverse(ast,{ReferencedIdentifier(p){const name=p.node.name;if(!p.scope.hasBinding(name)&&exports.has(name)&&exports.get(name)!==file)missing.set(name,exports.get(name));}});const groups=new Map();for(const [name,target]of missing){let rel=path.relative(path.dirname(file),target);if(!rel.startsWith('.'))rel='./'+rel;if(!groups.has(rel))groups.set(rel,[]);groups.get(rel).push(name);}for(const [rel,names]of groups)source=`import {${names.join(',')}} from '${rel}';\n`+source;
if(file.endsWith('/runtime.mjs')||file.endsWith('/controller.mjs')){
 ast=parse(source,{sourceType:'module'});let used=false;
 traverse(ast,{AssignmentExpression(p){const left=p.node.left;if(p.node.operator==='='&&t.isMemberExpression(left)&&!left.computed&&left.property.name==='innerHTML'){used=true;p.replaceWith(t.callExpression(t.identifier('renderRegion'),[left.object,p.node.right]));}else if(p.node.operator==='='&&t.isMemberExpression(left)&&!left.computed&&left.property.name==='outerHTML'){used=true;p.replaceWith(t.callExpression(t.identifier('replaceRegion'),[left.object,p.node.right]));}}});
 source=generate(ast,{compact:false,comments:true}).code;
 if(used){let rel=path.relative(path.dirname(file),path.join(root,'design-system/Markup.tsx'));if(!rel.startsWith('.'))rel='./'+rel;source=`import {renderRegion,replaceRegion,snapshotElement,disposeRegion} from '${rel}';\n`+source;}
}
fs.writeFileSync(file,source);
}
