<a name="adapt"></a>

## adapt(definition) ⇒ [<code>external:StandardItemDefinition</code>](https://github.com/zhaoyao91/the-holder/blob/master/api.md#Holder..StandardItemDefinition)
**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| definition | <code>object</code> |  |
| definition.serviceName | <code>string</code> |  |
| definition.mapperName | <code>string</code> |  |
| [definition.validator] | <code>function</code> | (data) => data, or throw validation error |
| definition.inTopic | <code>string</code> |  |
| definition.outTopic | <code>string</code> |  |
| [definition.mapData] | [<code>DataMapper</code>](#adapt..DataMapper) |  |


* [adapt(definition)](#adapt) ⇒ [<code>external:StandardItemDefinition</code>](https://github.com/zhaoyao91/the-holder/blob/master/api.md#Holder..StandardItemDefinition)
    * [~DataMapper](#adapt..DataMapper) ⇒ <code>Promise.&lt;any&gt;</code>
        * [.definition](#adapt..DataMapper+definition) : <code>object</code>
        * [.items](#adapt..DataMapper+items) : <code>object</code>

<a name="adapt..DataMapper"></a>

### adapt~DataMapper ⇒ <code>Promise.&lt;any&gt;</code>
**Kind**: inner typedef of [<code>adapt</code>](#adapt)  

| Param | Type |
| --- | --- |
| data | <code>any</code> | 


* [~DataMapper](#adapt..DataMapper) ⇒ <code>Promise.&lt;any&gt;</code>
    * [.definition](#adapt..DataMapper+definition) : <code>object</code>
    * [.items](#adapt..DataMapper+items) : <code>object</code>

<a name="adapt..DataMapper+definition"></a>

#### dataMapper.definition : <code>object</code>
the final definition for this item

**Kind**: instance typedef of [<code>DataMapper</code>](#adapt..DataMapper)  
<a name="adapt..DataMapper+items"></a>

#### dataMapper.items : <code>object</code>
items built before this item

**Kind**: instance typedef of [<code>DataMapper</code>](#adapt..DataMapper)  
