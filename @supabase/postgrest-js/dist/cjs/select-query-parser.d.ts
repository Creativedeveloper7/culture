import { GenericSchema, Prettify } from './types';
declare type Whitespace = ' ' | '\n' | '\t';
declare type LowerAlphabet = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z';
declare type Alphabet = LowerAlphabet | Uppercase<LowerAlphabet>;
declare type Digit = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '0';
declare type Letter = Alphabet | Digit | '_';
declare type Json = string | number | boolean | null | {
    [key: string]: Json;
} | Json[];
declare type SingleValuePostgreSQLTypes = 'bool' | 'int2' | 'int4' | 'int8' | 'float4' | 'float8' | 'numeric' | 'bytea' | 'bpchar' | 'varchar' | 'date' | 'text' | 'citext' | 'time' | 'timetz' | 'timestamp' | 'timestamptz' | 'uuid' | 'vector' | 'json' | 'jsonb' | 'void' | 'record' | string;
declare type ArrayPostgreSQLTypes = `_${SingleValuePostgreSQLTypes}`;
declare type PostgreSQLTypes = SingleValuePostgreSQLTypes | ArrayPostgreSQLTypes;
declare type TypeScriptSingleValueTypes<T extends SingleValuePostgreSQLTypes> = T extends 'bool' ? boolean : T extends 'int2' | 'int4' | 'int8' | 'float4' | 'float8' | 'numeric' ? number : T extends 'bytea' | 'bpchar' | 'varchar' | 'date' | 'text' | 'citext' | 'time' | 'timetz' | 'timestamp' | 'timestamptz' | 'uuid' | 'vector' ? string : T extends 'json' | 'jsonb' ? Json : T extends 'void' ? undefined : T extends 'record' ? Record<string, unknown> : unknown;
declare type AggregateFunctions = 'count' | 'sum' | 'avg' | 'min' | 'max';
declare type StripUnderscore<T extends string> = T extends `_${infer U}` ? U : T;
declare type TypeScriptTypes<T extends PostgreSQLTypes> = T extends ArrayPostgreSQLTypes ? TypeScriptSingleValueTypes<StripUnderscore<Extract<T, SingleValuePostgreSQLTypes>>>[] : TypeScriptSingleValueTypes<T>;
/**
 * Parser errors.
 */
declare type ParserError<Message extends string> = {
    error: true;
} & Message;
declare type GenericStringError = ParserError<'Received a generic string'>;
export declare type SelectQueryError<Message extends string> = {
    error: true;
} & Message;
/**
 * Creates a new {@link ParserError} if the given input is not already a parser error.
 */
declare type CreateParserErrorIfRequired<Input, Message extends string> = Input extends ParserError<string> ? Input : ParserError<Message>;
/**
 * Trims whitespace from the left of the input.
 */
declare type EatWhitespace<Input extends string> = string extends Input ? GenericStringError : Input extends `${Whitespace}${infer Remainder}` ? EatWhitespace<Remainder> : Input;
/**
 * Returns a boolean representing whether there is a foreign key with the given name.
 */
declare type HasFKey<FKeyName, Relationships> = Relationships extends [infer R] ? R extends {
    foreignKeyName: FKeyName;
} ? true : false : Relationships extends [infer R, ...infer Rest] ? HasFKey<FKeyName, [R]> extends true ? true : HasFKey<FKeyName, Rest> : false;
/**
 * Returns a boolean representing whether there the foreign key has a unique constraint.
 */
declare type HasUniqueFKey<FKeyName, Relationships> = Relationships extends [infer R] ? R extends {
    foreignKeyName: FKeyName;
    isOneToOne: true;
} ? true : false : Relationships extends [infer R, ...infer Rest] ? HasUniqueFKey<FKeyName, [R]> extends true ? true : HasUniqueFKey<FKeyName, Rest> : false;
/**
 * Returns a boolean representing whether there is a foreign key referencing
 * a given relation.
 */
declare type HasFKeyToFRel<FRelName, Relationships> = Relationships extends [infer R] ? R extends {
    referencedRelation: FRelName;
} ? true : false : Relationships extends [infer R, ...infer Rest] ? HasFKeyToFRel<FRelName, [R]> extends true ? true : HasFKeyToFRel<FRelName, Rest> : false;
declare type HasUniqueFKeyToFRel<FRelName, Relationships> = Relationships extends [infer R] ? R extends {
    referencedRelation: FRelName;
    isOneToOne: true;
} ? true : false : Relationships extends [infer R, ...infer Rest] ? HasUniqueFKeyToFRel<FRelName, [R]> extends true ? true : HasUniqueFKeyToFRel<FRelName, Rest> : false;
/**
 * Constructs a type definition for a single field of an object.
 *
 * @param Schema Database schema.
 * @param Row Type of a row in the given table.
 * @param Relationships Relationships between different tables in the database.
 * @param Field Single field parsed by `ParseQuery`.
 */
declare type ConstructFieldDefinition<Schema extends GenericSchema, Row extends Record<string, unknown>, RelationName, Relationships, Field> = Field extends {
    star: true;
} ? Row : Field extends {
    spread: true;
    original: string;
    children: unknown[];
} ? GetResultHelper<Schema, (Schema['Tables'] & Schema['Views'])[Field['original']]['Row'], Field['original'], (Schema['Tables'] & Schema['Views'])[Field['original']] extends {
    Relationships: infer R;
} ? R : unknown, Field['children'], unknown> : Field extends {
    children: [];
} ? {} : Field extends {
    name: string;
    original: string;
    hint: string;
    children: unknown[];
} ? {
    [_ in Field['name']]: GetResultHelper<Schema, (Schema['Tables'] & Schema['Views'])[Field['original']]['Row'], Field['original'], (Schema['Tables'] & Schema['Views'])[Field['original']] extends {
        Relationships: infer R;
    } ? R : unknown, Field['children'], unknown> extends infer Child ? HasUniqueFKey<Field['hint'], (Schema['Tables'] & Schema['Views'])[Field['original']] extends {
        Relationships: infer R;
    } ? R : unknown> extends true ? Field extends {
        inner: true;
    } ? Child : Child | null : Relationships extends unknown[] ? HasFKey<Field['hint'], Relationships> extends true ? Field extends {
        inner: true;
    } ? Child : Child | null : Child[] : Child[] : never;
} : Field extends {
    name: string;
    original: string;
    children: unknown[];
} ? {
    [_ in Field['name']]: GetResultHelper<Schema, (Schema['Tables'] & Schema['Views'])[Field['original']]['Row'], Field['original'], (Schema['Tables'] & Schema['Views'])[Field['original']] extends {
        Relationships: infer R;
    } ? R : unknown, Field['children'], unknown> extends infer Child ? HasUniqueFKeyToFRel<RelationName, (Schema['Tables'] & Schema['Views'])[Field['original']] extends {
        Relationships: infer R;
    } ? R : unknown> extends true ? Field extends {
        inner: true;
    } ? Child : Child | null : Relationships extends unknown[] ? HasFKeyToFRel<Field['original'], Relationships> extends true ? Field extends {
        inner: true;
    } ? Child : Field extends {
        left: true;
    } ? // TODO: This should return null only if the column is actually nullable
    Child | null : Child | null : Child[] : Child[] : never;
} : Field extends {
    name: string;
    type: infer T;
} ? {
    [K in Field['name']]: T;
} : Field extends {
    name: string;
    original: string;
} ? Field['original'] extends keyof Row ? {
    [K in Field['name']]: Row[Field['original']];
} : Field['original'] extends 'count' ? {
    count: number;
} : SelectQueryError<`Referencing missing column \`${Field['original']}\``> : Record<string, unknown>;
/**
 * Notes: all `Parse*` types assume that their input strings have their whitespace
 * removed. They return tuples of ["Return Value", "Remainder of text"] or
 * a `ParserError`.
 */
/**
 * Reads a consecutive sequence of 1 or more letter, where letters are `[0-9a-zA-Z_]`.
 */
declare type ReadLetters<Input extends string> = string extends Input ? GenericStringError : ReadLettersHelper<Input, ''> extends [`${infer Letters}`, `${infer Remainder}`] ? Letters extends '' ? ParserError<`Expected letter at \`${Input}\``> : [Letters, Remainder] : ReadLettersHelper<Input, ''>;
declare type ReadLettersHelper<Input extends string, Acc extends string> = string extends Input ? GenericStringError : Input extends `${infer L}${infer Remainder}` ? L extends Letter ? ReadLettersHelper<Remainder, `${Acc}${L}`> : [Acc, Input] : [Acc, ''];
/**
 * Reads a consecutive sequence of 1 or more double-quoted letters,
 * where letters are `[^"]`.
 */
declare type ReadQuotedLetters<Input extends string> = string extends Input ? GenericStringError : Input extends `"${infer Remainder}` ? ReadQuotedLettersHelper<Remainder, ''> extends [`${infer Letters}`, `${infer Remainder}`] ? Letters extends '' ? ParserError<`Expected string at \`${Remainder}\``> : [Letters, Remainder] : ReadQuotedLettersHelper<Remainder, ''> : ParserError<`Not a double-quoted string at \`${Input}\``>;
declare type ReadQuotedLettersHelper<Input extends string, Acc extends string> = string extends Input ? GenericStringError : Input extends `${infer L}${infer Remainder}` ? L extends '"' ? [Acc, Remainder] : ReadQuotedLettersHelper<Remainder, `${Acc}${L}`> : ParserError<`Missing closing double-quote in \`"${Acc}${Input}\``>;
/**
 * Parses a (possibly double-quoted) identifier.
 * Identifiers are sequences of 1 or more letters.
 */
declare type ParseIdentifier<Input extends string> = ReadLetters<Input> extends [
    infer Name,
    `${infer Remainder}`
] ? [Name, `${Remainder}`] : ReadQuotedLetters<Input> extends [infer Name, `${infer Remainder}`] ? [Name, `${Remainder}`] : ParserError<`No (possibly double-quoted) identifier at \`${Input}\``>;
/**
 * Parses a field without preceding field renaming.
 * A field is one of the following:
 * - a field with an embedded resource
 *   - `field(nodes)`
 *   - `field!hint(nodes)`
 *   - `field!inner(nodes)`
 *   - `field!left(nodes)`
 *   - `field!hint!inner(nodes)`
 * - a field without an embedded resource (see {@link ParseFieldWithoutEmbeddedResource})
 */
declare type ParseField<Input extends string> = Input extends '' ? ParserError<'Empty string'> : ParseIdentifier<Input> extends [infer Name, `${infer Remainder}`] ? EatWhitespace<Remainder> extends `!inner${infer Remainder}` ? ParseEmbeddedResource<EatWhitespace<Remainder>> extends [infer Fields, `${infer Remainder}`] ? [
    {
        name: Name;
        original: Name;
        children: Fields;
        inner: true;
    },
    EatWhitespace<Remainder>
] : CreateParserErrorIfRequired<ParseEmbeddedResource<EatWhitespace<Remainder>>, 'Expected embedded resource after `!inner`'> : EatWhitespace<Remainder> extends `!left${infer Remainder}` ? ParseEmbeddedResource<EatWhitespace<Remainder>> extends [infer Fields, `${infer Remainder}`] ? [
    {
        name: Name;
        original: Name;
        children: Fields;
        left: true;
    },
    EatWhitespace<Remainder>
] : CreateParserErrorIfRequired<ParseEmbeddedResource<EatWhitespace<Remainder>>, 'Expected embedded resource after `!left`'> : EatWhitespace<Remainder> extends `!${infer Remainder}` ? ParseIdentifier<EatWhitespace<Remainder>> extends [infer Hint, `${infer Remainder}`] ? EatWhitespace<Remainder> extends `!inner${infer Remainder}` ? ParseEmbeddedResource<EatWhitespace<Remainder>> extends [
    infer Fields,
    `${infer Remainder}`
] ? [
    {
        name: Name;
        original: Name;
        hint: Hint;
        children: Fields;
        inner: true;
    },
    EatWhitespace<Remainder>
] : CreateParserErrorIfRequired<ParseEmbeddedResource<EatWhitespace<Remainder>>, 'Expected embedded resource after `!inner`'> : ParseEmbeddedResource<EatWhitespace<Remainder>> extends [
    infer Fields,
    `${infer Remainder}`
] ? [
    {
        name: Name;
        original: Name;
        hint: Hint;
        children: Fields;
    },
    EatWhitespace<Remainder>
] : CreateParserErrorIfRequired<ParseEmbeddedResource<EatWhitespace<Remainder>>, 'Expected embedded resource after `!hint`'> : ParserError<'Expected identifier after `!`'> : ParseEmbeddedResource<EatWhitespace<Remainder>> extends [infer Fields, `${infer Remainder}`] ? [
    {
        name: Name;
        original: Name;
        children: Fields;
    },
    EatWhitespace<Remainder>
] : ParseEmbeddedResource<EatWhitespace<Remainder>> extends ParserError<string> ? ParseEmbeddedResource<EatWhitespace<Remainder>> : ParseFieldWithoutEmbeddedResource<Input> : ParserError<`Expected identifier at \`${Input}\``>;
/**
 * Parses a field excluding embedded resources, without preceding field renaming.
 * This is one of the following:
 * - `field`
 * - `field.aggregate()`
 * - `field.aggregate()::type`
 * - `field::type`
 * - `field::type.aggregate()`
 * - `field::type.aggregate()::type`
 * - `field->json...`
 * - `field->json.aggregate()`
 * - `field->json.aggregate()::type`
 * - `field->json::type`
 * - `field->json::type.aggregate()`
 * - `field->json::type.aggregate()::type`
 */
declare type ParseFieldWithoutEmbeddedResource<Input extends string> = ParseFieldWithoutEmbeddedResourceAndAggregation<Input> extends [infer Field, `${infer Remainder}`] ? ParseFieldAggregation<EatWhitespace<Remainder>> extends [
    `${infer AggregateFunction}`,
    `${infer Remainder}`
] ? ParseFieldTypeCast<EatWhitespace<Remainder>> extends [infer Type, `${infer Remainder}`] ? [
    Omit<Field, 'name' | 'original' | 'type'> & {
        name: AggregateFunction;
        original: AggregateFunction;
        type: Type;
    },
    EatWhitespace<Remainder>
] : ParseFieldTypeCast<EatWhitespace<Remainder>> extends ParserError<string> ? ParseFieldTypeCast<EatWhitespace<Remainder>> : [
    Omit<Field, 'name' | 'original'> & {
        name: AggregateFunction;
        original: AggregateFunction;
    },
    EatWhitespace<Remainder>
] : ParseFieldAggregation<EatWhitespace<Remainder>> extends ParserError<string> ? ParseFieldAggregation<EatWhitespace<Remainder>> : [
    Field,
    EatWhitespace<Remainder>
] : CreateParserErrorIfRequired<ParseFieldWithoutEmbeddedResourceAndAggregation<Input>, `Expected field at \`${Input}\``>;
/**
 * Parses a field excluding embedded resources or aggregation, without preceding field renaming.
 * This is one of the following:
 * - `field`
 * - `field::type`
 * - `field->json...`
 * - `field->json...::type`
 */
declare type ParseFieldWithoutEmbeddedResourceAndAggregation<Input extends string> = ParseFieldWithoutEmbeddedResourceAndTypeCast<Input> extends [infer Field, `${infer Remainder}`] ? ParseFieldTypeCast<EatWhitespace<Remainder>> extends [infer Type, `${infer Remainder}`] ? [
    Omit<Field, 'type'> & {
        type: Type;
    },
    EatWhitespace<Remainder>
] : ParseFieldTypeCast<EatWhitespace<Remainder>> extends ParserError<string> ? ParseFieldTypeCast<EatWhitespace<Remainder>> : [
    Field,
    EatWhitespace<Remainder>
] : CreateParserErrorIfRequired<ParseFieldWithoutEmbeddedResourceAndTypeCast<Input>, `Expected field at \`${Input}\``>;
/**
 * Parses a field excluding embedded resources or typecasting, without preceding field renaming.
 * This is one of the following:
 * - `field`
 * - `field->json...`
 */
declare type ParseFieldWithoutEmbeddedResourceAndTypeCast<Input extends string> = ParseIdentifier<Input> extends [infer Name, `${infer Remainder}`] ? ParseJsonAccessor<EatWhitespace<Remainder>> extends [
    infer PropertyName,
    infer PropertyType,
    `${infer Remainder}`
] ? [
    {
        name: PropertyName;
        original: PropertyName;
        type: PropertyType;
    },
    EatWhitespace<Remainder>
] : [
    {
        name: Name;
        original: Name;
    },
    EatWhitespace<Remainder>
] : ParserError<`Expected field at \`${Input}\``>;
/**
 * Parses a field typecast (`::type`), returning a tuple of ["Type", "Remainder of text"]
 * or the original string input indicating that no typecast was found.
 */
declare type ParseFieldTypeCast<Input extends string> = EatWhitespace<Input> extends `::${infer Remainder}` ? ParseIdentifier<EatWhitespace<Remainder>> extends [`${infer CastType}`, `${infer Remainder}`] ? CastType extends PostgreSQLTypes ? [TypeScriptTypes<CastType>, EatWhitespace<Remainder>] : ParserError<`Invalid type for \`::\` operator \`${CastType}\``> : ParserError<`Invalid type for \`::\` operator at \`${Remainder}\``> : Input;
/**
 * Parses a field aggregation (`.max()`), returning a tuple of ["Aggregate function", "Remainder of text"]
 * or the original string input indicating that no aggregation was found.
 */
declare type ParseFieldAggregation<Input extends string> = EatWhitespace<Input> extends `.${infer Remainder}` ? ParseIdentifier<EatWhitespace<Remainder>> extends [
    `${infer FunctionName}`,
    `${infer Remainder}`
] ? FunctionName extends AggregateFunctions ? EatWhitespace<Remainder> extends `()${infer Remainder}` ? [FunctionName, EatWhitespace<Remainder>] : ParserError<`Expected \`()\` after \`.\` operator \`${FunctionName}\``> : ParserError<`Invalid type for \`.\` operator \`${FunctionName}\``> : ParserError<`Invalid type for \`.\` operator at \`${Remainder}\``> : Input;
/**
 * Parses a node.
 * A node is one of the following:
 * - `*`
 * - a field, as defined above
 * - a renamed field, `renamed_field:field`
 * - a spread field, `...field`
 */
declare type ParseNode<Input extends string> = Input extends '' ? ParserError<'Empty string'> : Input extends `*${infer Remainder}` ? [{
    star: true;
}, EatWhitespace<Remainder>] : Input extends `...${infer Remainder}` ? ParseField<EatWhitespace<Remainder>> extends [infer Field, `${infer Remainder}`] ? Field extends {
    children: unknown[];
} ? [Prettify<{
    spread: true;
} & Field>, EatWhitespace<Remainder>] : ParserError<'Unable to parse spread resource'> : ParserError<'Unable to parse spread resource'> : ParseIdentifier<Input> extends [infer Name, `${infer Remainder}`] ? EatWhitespace<Remainder> extends `::${infer _Remainder}` ? ParseField<Input> : EatWhitespace<Remainder> extends `:${infer Remainder}` ? ParseField<EatWhitespace<Remainder>> extends [infer Field, `${infer Remainder}`] ? Field extends {
    name: string;
} ? [Prettify<Omit<Field, 'name'> & {
    name: Name;
}>, EatWhitespace<Remainder>] : ParserError<`Unable to parse renamed field`> : ParserError<`Unable to parse renamed field`> : ParseField<Input> : ParserError<`Expected identifier at \`${Input}\``>;
/**
 * Parses a JSON property accessor of the shape `->a->b->c`. The last accessor in
 * the series may convert to text by using the ->> operator instead of ->.
 *
 * Returns a tuple of ["Last property name", "Last property type", "Remainder of text"]
 * or the original string input indicating that no opening `->` was found.
 */
declare type ParseJsonAccessor<Input extends string> = Input extends `->${infer Remainder}` ? Remainder extends `>${infer Remainder}` ? ParseIdentifier<Remainder> extends [infer Name, `${infer Remainder}`] ? [Name, string, EatWhitespace<Remainder>] : ParserError<'Expected property name after `->>`'> : ParseIdentifier<Remainder> extends [infer Name, `${infer Remainder}`] ? ParseJsonAccessor<Remainder> extends [
    infer PropertyName,
    infer PropertyType,
    `${infer Remainder}`
] ? [PropertyName, PropertyType, EatWhitespace<Remainder>] : [Name, Json, EatWhitespace<Remainder>] : ParserError<'Expected property name after `->`'> : Input;
/**
 * Parses an embedded resource, which is an opening `(`, followed by a sequence of
 * 0 or more nodes separated by `,`, then a closing `)`.
 *
 * Returns a tuple of ["Parsed fields", "Remainder of text"], an error,
 * or the original string input indicating that no opening `(` was found.
 */
declare type ParseEmbeddedResource<Input extends string> = Input extends `(${infer Remainder}` ? ParseNodes<EatWhitespace<Remainder>> extends [infer Fields, `${infer Remainder}`] ? EatWhitespace<Remainder> extends `)${infer Remainder}` ? [Fields, EatWhitespace<Remainder>] : ParserError<`Expected ")"`> : ParseNodes<EatWhitespace<Remainder>> extends ParserError<string> ? EatWhitespace<Remainder> extends `)${infer Remainder}` ? [[], EatWhitespace<Remainder>] : ParseNodes<EatWhitespace<Remainder>> : ParserError<'Expected embedded resource fields or `)`'> : Input;
/**
 * Parses a sequence of nodes, separated by `,`.
 *
 * Returns a tuple of ["Parsed fields", "Remainder of text"] or an error.
 */
declare type ParseNodes<Input extends string> = string extends Input ? GenericStringError : ParseNodesHelper<Input, []>;
declare type ParseNodesHelper<Input extends string, Fields extends unknown[]> = ParseNode<Input> extends [
    infer Field,
    `${infer Remainder}`
] ? EatWhitespace<Remainder> extends `,${infer Remainder}` ? ParseNodesHelper<EatWhitespace<Remainder>, [Field, ...Fields]> : [[Field, ...Fields], EatWhitespace<Remainder>] : ParseNode<Input>;
/**
 * Parses a query.
 * A query is a sequence of nodes, separated by `,`, ensuring that there is
 * no remaining input after all nodes have been parsed.
 *
 * Returns an array of parsed nodes, or an error.
 */
declare type ParseQuery<Query extends string> = string extends Query ? GenericStringError : ParseNodes<EatWhitespace<Query>> extends [infer Fields, `${infer Remainder}`] ? EatWhitespace<Remainder> extends '' ? Fields : ParserError<`Unexpected input: ${Remainder}`> : ParseNodes<EatWhitespace<Query>>;
declare type GetResultHelper<Schema extends GenericSchema, Row extends Record<string, unknown>, RelationName, Relationships, Fields extends unknown[], Acc> = Fields extends [infer R] ? ConstructFieldDefinition<Schema, Row, RelationName, Relationships, R> extends SelectQueryError<infer E> ? SelectQueryError<E> : GetResultHelper<Schema, Row, RelationName, Relationships, [
], ConstructFieldDefinition<Schema, Row, RelationName, Relationships, R> & Acc> : Fields extends [infer R, ...infer Rest] ? ConstructFieldDefinition<Schema, Row, RelationName, Relationships, R> extends SelectQueryError<infer E> ? SelectQueryError<E> : GetResultHelper<Schema, Row, RelationName, Relationships, Rest, ConstructFieldDefinition<Schema, Row, RelationName, Relationships, R> & Acc> : Prettify<Acc>;
/**
 * Constructs a type definition for an object based on a given PostgREST query.
 *
 * @param Schema Database schema.
 * @param Row Type of a row in the given table.
 * @param Relationships Relationships between different tables in the database.
 * @param Query Select query string literal to parse.
 */
export declare type GetResult<Schema extends GenericSchema, Row extends Record<string, unknown>, RelationName, Relationships, Query extends string> = ParseQuery<Query> extends unknown[] ? GetResultHelper<Schema, Row, RelationName, Relationships, ParseQuery<Query>, unknown> : ParseQuery<Query>;
export {};
//# sourceMappingURL=select-query-parser.d.ts.map