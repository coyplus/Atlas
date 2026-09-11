import fs from 'node:fs';import path from 'node:path';import {parse} from '@babel/parser';import traverseModule from '@babel/traverse';import generateModule from '@babel/generator';import * as t from '@babel/types';
const traverse=traverseModule.default||traverseModule,generate=generateModule.default||generateModule;
const file='src/app/runtime.mjs',source=fs.readFileSync(file,'utf8'),ast=parse(source,{sourceType:'module'});let action;
traverse(ast,{FunctionDeclaration(p){if(p.node.id.name==='executeAction')action=p;}});
const globalBindings=Object.keys(action.scope.parent.bindings);const ctxNames=new Set(globalBindings.filter(name=>action.scope.parent.bindings[name].kind!=='module'));
const groupFor=type=>/^(container|condition|agreement|wallet|edit-pot|save-pot)/.test(type)?'pots':/^(support|chat|human|appointment|book|recovery)/.test(type)?'support':/^(quick|product|cards|card-|convert|statements|statement)/.test(type)?'actions':/^(connect|disconnect|collection|account)/.test(type)?'accounts':/^(idea|toggle-idea|preview-summary|review-idea|commit-idea|newplan|plan-|create-plan|redirect|save-redirect|view|time|zoom)/.test(type)?'future':/^(pay|transfer|addmoney|save-transfer)/.test(type)?'payments':/^(quiz|answer|personality|belief|autonomy|pause-all|permissions|points|redeem|invite|save-invite|receipts)/.test(type)?'profile':/^(gallery|preview-module|preview-size|pin|unpin|remove|size|up|edit)/.test(type)?'numbers':'navigation';
const groups=new Map(),routes={};const kept=[];
for(const node of action.node.body.body){let types=[];if(t.isIfStatement(node)){const test=t.file(t.program([t.expressionStatement(node.test)]));traverse(test,{BinaryExpression(p){if(t.isIdentifier(p.node.left,{name:'type'})&&t.isStringLiteral(p.node.right))types.push(p.node.right.value);}});}
 if(!types.length){kept.push(node);continue;}const group=groupFor(types[0]);if(!groups.has(group))groups.set(group,[]);groups.get(group).push(node);for(const type of types)routes[type]=group;
}
const imports=ast.program.body.filter(n=>t.isImportDeclaration(n));
for(const [group,nodes]of groups){const fn=t.functionDeclaration(t.identifier('handle'),[t.identifier('ctx'),t.identifier('type'),t.identifier('id'),t.identifier('p')],t.blockStatement(nodes));const unit=t.file(t.program([t.exportNamedDeclaration(fn)]));
 traverse(unit,{Identifier(p){if(!ctxNames.has(p.node.name)||p.scope.hasBinding(p.node.name))return;if(p.isReferencedIdentifier()||(p.parentPath.isAssignmentExpression()&&p.key==='left')||(p.parentPath.isUpdateExpression()&&p.key==='argument')){const name=p.node.name;p.replaceWith(t.memberExpression(t.identifier('ctx'),t.identifier(name)));p.skip();}}});
 const adjusted=imports.filter(n=>!n.source.value.includes('commands/')).map(n=>{const clone=t.cloneNode(n,true);clone.source.value='../'+clone.source.value;return clone;});unit.program.body.unshift(...adjusted);fs.mkdirSync('src/features/commands',{recursive:true});fs.writeFileSync('src/features/commands/'+group+'.mjs',generate(unit,{comments:true}).code);
}
const getters=[...ctxNames].map(name=>{const binding=action.scope.parent.bindings[name],mutable=binding.kind==='let'||binding.kind==='var';return `get ${name}(){return ${name};}${mutable?`,set ${name}(value){${name}=value;}`:''}`;}).join(',');
const statements=parse(`return commandHandlers[commandRoutes[type]]?.(commandContext,type,id,p);`,{allowReturnOutsideFunction:true}).program.body;
action.node.body.body=[...kept,...statements];
ast.program.body.unshift(...[...groups.keys()].map(group=>t.importDeclaration([t.importSpecifier(t.identifier('command_'+group),t.identifier('handle'))],t.stringLiteral('../features/commands/'+group+'.mjs'))));
const context=parse(`const commandContext={${getters}};const commandRoutes=${JSON.stringify(routes)};const commandHandlers={${[...groups.keys()].map(g=>g+':command_'+g).join(',')}};`).program.body;
// Getters avoid initialization ordering issues with the existing session controller.
const bootIndex=ast.program.body.findIndex(n=>t.isExpressionStatement(n)&&t.isCallExpression(n.expression)&&t.isIdentifier(n.expression.callee,{name:'render'}));ast.program.body.splice(bootIndex,0,...context);
fs.writeFileSync(file,generate(ast,{comments:true}).code);fs.writeFileSync('docs/command-inventory.json',JSON.stringify(routes,null,2));console.log(`${Object.keys(routes).length} commands in ${groups.size} feature groups`);
