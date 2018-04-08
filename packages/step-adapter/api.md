<a name="adapt"></a>

## adapt(definition) ⇒ [<code>external:StandardItemDefinition</code>](https://github.com/zhaoyao91/the-holder/blob/master/api.md#Holder..StandardItemDefinition)
**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| definition | <code>object</code> |  |
| definition.serviceName | <code>string</code> |  |
| definition.flowName | <code>string</code> |  |
| definition.stepName | <code>string</code> |  |
| definition.follow | [<code>followOptions</code>](#adapt..followOptions) \| [<code>Array.&lt;followOptions&gt;</code>](#adapt..followOptions) |  |
| [definition.validator] | <code>function</code> | (data) => data, or throw validation error |
| definition.handler | [<code>Handler</code>](#adapt..Handler) |  |
| [definition.emitCases] | <code>object</code> | key is case in js, value is case in message topic |


* [adapt(definition)](#adapt) ⇒ [<code>external:StandardItemDefinition</code>](https://github.com/zhaoyao91/the-holder/blob/master/api.md#Holder..StandardItemDefinition)
    * [~Handler](#adapt..Handler) : [<code>external:NatsExHandler</code>](https://github.com/zhaoyao91/nats-ex/blob/master/packages/nats-ex/docs/api.md#on)
        * [.definition](#adapt..Handler+definition) : <code>object</code>
        * [.items](#adapt..Handler+items) : <code>object</code>
        * [.emit](#adapt..Handler+emit) : <code>object</code>
    * [~followOptions](#adapt..followOptions) : <code>object</code>

<a name="adapt..Handler"></a>

### adapt~Handler : [<code>external:NatsExHandler</code>](https://github.com/zhaoyao91/nats-ex/blob/master/packages/nats-ex/docs/api.md#on)
The same as natsEx handler, but with some extra fields in function this

**Kind**: inner typedef of [<code>adapt</code>](#adapt)  

* [~Handler](#adapt..Handler) : [<code>external:NatsExHandler</code>](https://github.com/zhaoyao91/nats-ex/blob/master/packages/nats-ex/docs/api.md#on)
    * [.definition](#adapt..Handler+definition) : <code>object</code>
    * [.items](#adapt..Handler+items) : <code>object</code>
    * [.emit](#adapt..Handler+emit) : <code>object</code>

<a name="adapt..Handler+definition"></a>

#### handler.definition : <code>object</code>
the final definition for this item

**Kind**: instance typedef of [<code>Handler</code>](#adapt..Handler)  
<a name="adapt..Handler+items"></a>

#### handler.items : <code>object</code>
items built before this item

**Kind**: instance typedef of [<code>Handler</code>](#adapt..Handler)  
<a name="adapt..Handler+emit"></a>

#### handler.emit : <code>object</code>
side effect message emit helper.
corresponding to emitCases option in definition.
each value is a function of: (data) => messageId

**Kind**: instance typedef of [<code>Handler</code>](#adapt..Handler)  
<a name="adapt..followOptions"></a>

### adapt~followOptions : <code>object</code>
**Kind**: inner typedef of [<code>adapt</code>](#adapt)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| step | <code>string</code> |  |
| case | <code>string</code> |  |
| [validator] | <code>function</code> | the same as validator in definition |

