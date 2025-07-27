// https://gist.github.com/airtonix/5deec296bad0227ffc24be588b2da18a
/// <reference types="parsimmon" />
/// <reference types="jest" />
declare module "api/result" {
    /** Functional return type for error handling. */
    export class Success<T, E> {
        value: T;
        successful: true;
        constructor(value: T);
        map<U>(f: (a: T) => U): Result<U, E>;
        flatMap<U>(f: (a: T) => Result<U, E>): Result<U, E>;
        mapErr<U>(f: (e: E) => U): Result<T, U>;
        bimap<T2, E2>(succ: (a: T) => T2, _fail: (b: E) => E2): Result<T2, E2>;
        orElse(_value: T): T;
        cast<U>(): Result<U, E>;
        orElseThrow(_message?: (e: E) => string): T;
    }
    /** Functional return type for error handling. */
    export class Failure<T, E> {
        error: E;
        successful: false;
        constructor(error: E);
        map<U>(_f: (a: T) => U): Result<U, E>;
        flatMap<U>(_f: (a: T) => Result<U, E>): Result<U, E>;
        mapErr<U>(f: (e: E) => U): Result<T, U>;
        bimap<T2, E2>(_succ: (a: T) => T2, fail: (b: E) => E2): Result<T2, E2>;
        orElse(value: T): T;
        cast<U>(): Result<U, E>;
        orElseThrow(message?: (e: E) => string): T;
    }
    export type Result<T, E> = Success<T, E> | Failure<T, E>;
    /** Monadic 'Result' type which encapsulates whether a procedure succeeded or failed, as well as it's return value. */
    export namespace Result {
        /** Construct a new success result wrapping the given value. */
        function success<T, E>(value: T): Result<T, E>;
        /** Construct a new failure value wrapping the given error. */
        function failure<T, E>(error: E): Result<T, E>;
        /** Join two results with a bi-function and return a new result. */
        function flatMap2<T1, T2, O, E>(first: Result<T1, E>, second: Result<T2, E>, f: (a: T1, b: T2) => Result<O, E>): Result<O, E>;
        /** Join two results with a bi-function and return a new result. */
        function map2<T1, T2, O, E>(first: Result<T1, E>, second: Result<T2, E>, f: (a: T1, b: T2) => O): Result<O, E>;
    }
}
declare module "settings" {
    export interface QuerySettings {
        /** What to render 'null' as in tables. Defaults to '-'. */
        renderNullAs: string;
        /** If enabled, tasks in Dataview views will automatically have their completion date appended when they are checked. */
        taskCompletionTracking: boolean;
        /** If enabled, automatic completions will use emoji shorthand ✅ YYYY-MM-DD instead of [completion:: date]. */
        taskCompletionUseEmojiShorthand: boolean;
        /** The name of the inline field to be added as a task's completion when checked. Only used if completionTracking is enabled and emojiShorthand is not. */
        taskCompletionText: string;
        /** Date format of the task's completion timestamp. Only used if completionTracking is enabled and emojiShorthand is not. */
        taskCompletionDateFormat: string;
        /** If true, render a modal which shows no results were returned. */
        warnOnEmptyResult: boolean;
        /** Whether or not automatic view refreshing is enabled. */
        refreshEnabled: boolean;
        /** The interval that views are refreshed, by default. */
        refreshInterval: number;
        /** The default format that dates are rendered in (using luxon's moment-like formatting). */
        defaultDateFormat: string;
        /** The default format that date-times are rendered in (using luxons moment-like formatting). */
        defaultDateTimeFormat: string;
        /** Maximum depth that objects will be expanded when being rendered recursively. */
        maxRecursiveRenderDepth: number;
        /** The name of the default ID field ('File'). */
        tableIdColumnName: string;
        /** The name of default ID fields on grouped data ('Group'). */
        tableGroupColumnName: string;
    }
    export const DEFAULT_QUERY_SETTINGS: QuerySettings;
    export interface ExportSettings {
        /** Whether or not HTML should be used for formatting in exports. */
        allowHtml: boolean;
    }
    export const DEFAULT_EXPORT_SETTINGS: ExportSettings;
    export interface DataviewSettings extends QuerySettings, ExportSettings {
        /** The prefix for inline queries by default. */
        inlineQueryPrefix: string;
        /** The prefix for inline JS queries by default. */
        inlineJsQueryPrefix: string;
        /** If true, inline queries are also evaluated in full codeblocks. */
        inlineQueriesInCodeblocks: boolean;
        /** Enable or disable executing DataviewJS queries. */
        enableDataviewJs: boolean;
        /** Enable or disable executing inline DataviewJS queries. */
        enableInlineDataviewJs: boolean;
        /** Enable or disable rendering inline fields prettily. */
        prettyRenderInlineFields: boolean;
    }
    /** Default settings for dataview on install. */
    export const DEFAULT_SETTINGS: DataviewSettings;
}
declare module "util/normalize" {
    import { DateTime, Duration } from "luxon";
    import { Result } from "api/result";
    import { QuerySettings } from "settings";
    /** Normalize a duration to all of the proper units. */
    export function normalizeDuration(dur: Duration): Duration;
    /** Strip the time components of a date time object. */
    export function stripTime(dt: DateTime): DateTime;
    /** Try to extract a YYYYMMDD date from a string. */
    export function extractDate(str: string): DateTime | undefined;
    /** Get the folder containing the given path (i.e., like computing 'path/..'). */
    export function getParentFolder(path: string): string;
    /** Get the file name for the file referenced in the given path, by stripping the parent folders. */
    export function getFileName(path: string): string;
    /** Get the "title" for a file, by stripping other parts of the path as well as the extension. */
    export function getFileTitle(path: string): string;
    /** Get the extension of a file from the file path. */
    export function getExtension(path: string): string;
    /** Parse all subtags out of the given tag. I.e., #hello/i/am would yield [#hello/i/am, #hello/i, #hello]. */
    export function extractSubtags(tag: string): string[];
    /** Try calling the given function; on failure, return the error message.  */
    export function tryOrPropogate<T>(func: () => Result<T, string>): Result<T, string>;
    /** Try asynchronously calling the given function; on failure, return the error message. */
    export function asyncTryOrPropogate<T>(func: () => Promise<Result<T, string>>): Promise<Result<T, string>>;
    /**
     * Escape regex characters in a string.
     * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions.
     */
    export function escapeRegex(str: string): string;
    /** Convert an arbitrary variable name into something JS/query friendly. */
    export function canonicalizeVarName(name: string): string;
    /**
     * Normalizes the text in a header to be something that is actually linkable to. This mimics
     * how Obsidian does it's normalization, collapsing repeated spaces and stripping out control characters.
     */
    export function normalizeHeaderForLink(header: string): string;
    /** Render a DateTime in a minimal format to save space. */
    export function renderMinimalDate(time: DateTime, settings: QuerySettings, locale: string): string;
    /** Render a duration in a minimal format to save space. */
    export function renderMinimalDuration(dur: Duration): string;
    /** Determine if two sets are equal in contents. */
    export function setsEqual<T>(first: Set<T>, second: Set<T>): boolean;
}
declare module "data-model/value" {
    import { DateTime, Duration } from "luxon";
    import { QuerySettings } from "settings";
    /** Shorthand for a mapping from keys to values. */
    export type DataObject = {
        [key: string]: Literal;
    };
    /** The literal types supported by the query engine. */
    export type LiteralType = "boolean" | "number" | "string" | "date" | "duration" | "link" | "array" | "object" | "function" | "null" | "html" | "widget";
    /** The raw values that a literal can take on. */
    export type Literal = boolean | number | string | DateTime | Duration | Link | Array<Literal> | DataObject | Function | null | HTMLElement | Widget;
    /** A grouping on a type which supports recursively-nested groups. */
    export type GroupElement<T> = {
        key: Literal;
        rows: Grouping<T>;
    };
    export type Grouping<T> = T[] | GroupElement<T>[];
    /** Maps the string type to it's external, API-facing representation. */
    export type LiteralRepr<T extends LiteralType> = T extends "boolean" ? boolean : T extends "number" ? number : T extends "string" ? string : T extends "duration" ? Duration : T extends "date" ? DateTime : T extends "null" ? null : T extends "link" ? Link : T extends "array" ? Array<Literal> : T extends "object" ? Record<string, Literal> : T extends "function" ? Function : T extends "html" ? HTMLElement : T extends "widget" ? Widget : any;
    /** A wrapped literal value which can be switched on. */
    export type WrappedLiteral = LiteralWrapper<"string"> | LiteralWrapper<"number"> | LiteralWrapper<"boolean"> | LiteralWrapper<"date"> | LiteralWrapper<"duration"> | LiteralWrapper<"link"> | LiteralWrapper<"array"> | LiteralWrapper<"object"> | LiteralWrapper<"html"> | LiteralWrapper<"widget"> | LiteralWrapper<"function"> | LiteralWrapper<"null">;
    export interface LiteralWrapper<T extends LiteralType> {
        type: T;
        value: LiteralRepr<T>;
    }
    export namespace Values {
        /** Convert an arbitary value into a reasonable, Markdown-friendly string if possible. */
        function toString(field: any, setting?: QuerySettings, recursive?: boolean): string;
        /** Wrap a literal value so you can switch on it easily. */
        function wrapValue(val: Literal): WrappedLiteral | undefined;
        /** Recursively map complex objects at the leaves. */
        function mapLeaves(val: Literal, func: (t: Literal) => Literal): Literal;
        /** Compare two arbitrary JavaScript values. Produces a total ordering over ANY possible dataview value. */
        function compareValue(val1: Literal, val2: Literal, linkNormalizer?: (link: string) => string): number;
        /** Find the corresponding Dataveiw type for an arbitrary value. */
        function typeOf(val: any): LiteralType | undefined;
        /** Determine if the given value is "truthy" (i.e., is non-null and has data in it). */
        function isTruthy(field: Literal): boolean;
        /** Deep copy a field. */
        function deepCopy<T extends Literal>(field: T): T;
        function isString(val: any): val is string;
        function isNumber(val: any): val is number;
        function isDate(val: any): val is DateTime;
        function isDuration(val: any): val is Duration;
        function isNull(val: any): val is null | undefined;
        function isArray(val: any): val is any[];
        function isBoolean(val: any): val is boolean;
        function isLink(val: any): val is Link;
        function isWidget(val: any): val is Widget;
        function isHtml(val: any): val is HTMLElement;
        /** Checks if the given value is an object (and not any other dataview-recognized object-like type). */
        function isObject(val: any): val is Record<string, any>;
        function isFunction(val: any): val is Function;
    }
    export namespace Groupings {
        /** Determines if the given group entry is a standalone value, or a grouping of sub-entries. */
        function isElementGroup<T>(entry: T | GroupElement<T>): entry is GroupElement<T>;
        /** Determines if the given array is a grouping array. */
        function isGrouping<T>(entry: Grouping<T>): entry is GroupElement<T>[];
        /** Count the total number of elements in a recursive grouping. */
        function count<T>(elements: Grouping<T>): number;
    }
    /** The Obsidian 'link', used for uniquely describing a file, header, or block. */
    export class Link {
        /** The file path this link points to. */
        path: string;
        /** The display name associated with the link. */
        display?: string;
        /** The block ID or header this link points to within a file, if relevant. */
        subpath?: string;
        /** Is this link an embedded link (!)? */
        embed: boolean;
        /** The type of this link, which determines what 'subpath' refers to, if anything. */
        type: "file" | "header" | "block";
        /** Create a link to a specific file. */
        static file(path: string, embed?: boolean, display?: string): Link;
        static infer(linkpath: string, embed?: boolean, display?: string): Link;
        /** Create a link to a specific file and header in that file. */
        static header(path: string, header: string, embed?: boolean, display?: string): Link;
        /** Create a link to a specific file and block in that file. */
        static block(path: string, blockId: string, embed?: boolean, display?: string): Link;
        static fromObject(object: Record<string, any>): Link;
        private constructor();
        /** Checks for link equality (i.e., that the links are pointing to the same exact location). */
        equals(other: Link): boolean;
        /** Convert this link to it's markdown representation. */
        toString(): string;
        /** Convert this link to a raw object which is serialization-friendly. */
        toObject(): Record<string, any>;
        /** Update this link with a new path. */
        withPath(path: string): any;
        /** Return a new link which points to the same location but with a new display value. */
        withDisplay(display?: string): Link;
        /** Convert a file link into a link to a specific header. */
        withHeader(header: string): Link;
        /** Convert any link into a link to its file. */
        toFile(): Link;
        /** Convert this link into an embedded link. */
        toEmbed(): Link;
        /** Convert this link into a non-embedded link. */
        fromEmbed(): Link;
        /** Convert this link to markdown so it can be rendered. */
        markdown(): string;
        /** Convert the inner part of the link to something that Obsidian can open / understand. */
        obsidianLink(): string;
        /** The stripped name of the file this link points to. */
        fileName(): string;
    }
    /**
     * A trivial base class which just defines the '$widget' identifier type. Subtypes of
     * widget are responsible for adding whatever metadata is relevant. If you want your widget
     * to have rendering functionality (which you probably do), you should extend `RenderWidget`.
     */
    export abstract class Widget {
        $widget: string;
        constructor($widget: string);
        /**
         * Attempt to render this widget in markdown, if possible; if markdown is not possible,
         * then this will attempt to render as HTML. Note that many widgets have interactive
         * components or difficult functional components and the `markdown` function can simply
         * return a placeholder in this case (such as `<function>` or `<task-list>`).
         */
        abstract markdown(): string;
    }
    /** A trivial widget which renders a (key, value) pair, and allows accessing the key and value. */
    export class ListPairWidget extends Widget {
        key: Literal;
        value: Literal;
        constructor(key: Literal, value: Literal);
        markdown(): string;
    }
    /** A simple widget which renders an external link. */
    export class ExternalLinkWidget extends Widget {
        url: string;
        display?: string | undefined;
        constructor(url: string, display?: string | undefined);
        markdown(): string;
    }
    export namespace Widgets {
        /** Create a list pair widget matching the given key and value. */
        function listPair(key: Literal, value: Literal): ListPairWidget;
        /** Create an external link widget which renders an external Obsidian link. */
        function externalLink(url: string, display?: string): ExternalLinkWidget;
        /** Checks if the given widget is a list pair widget. */
        function isListPair(widget: Widget): widget is ListPairWidget;
        function isExternalLink(widget: Widget): widget is ExternalLinkWidget;
        /** Determines if the given widget is any kind of built-in widget with special rendering handling. */
        function isBuiltin(widget: Widget): boolean;
    }
}
declare module "expression/field" {
    /** Defines the AST for a field which can be evaluated. */
    import { Literal } from "data-model/value";
    /** Comparison operators which yield true/false. */
    export type CompareOp = ">" | ">=" | "<=" | "<" | "=" | "!=";
    /** Arithmetic operators which yield numbers and other values. */
    export type ArithmeticOp = "+" | "-" | "*" | "/" | "%" | "&" | "|";
    /** All valid binary operators. */
    export type BinaryOp = CompareOp | ArithmeticOp;
    /** A (potentially computed) field to select or compare against. */
    export type Field = BinaryOpField | VariableField | LiteralField | FunctionField | IndexField | NegatedField | LambdaField | ObjectField | ListField;
    /** Literal representation of some field type. */
    export interface LiteralField {
        type: "literal";
        value: Literal;
    }
    /** A variable field for a variable with a given name. */
    export interface VariableField {
        type: "variable";
        name: string;
    }
    /** A list, which is an ordered collection of fields. */
    export interface ListField {
        type: "list";
        values: Field[];
    }
    /** An object, which is a mapping of name to field. */
    export interface ObjectField {
        type: "object";
        values: Record<string, Field>;
    }
    /** A binary operator field which combines two subnodes somehow. */
    export interface BinaryOpField {
        type: "binaryop";
        left: Field;
        right: Field;
        op: BinaryOp;
    }
    /** A function field which calls a function on 0 or more arguments. */
    export interface FunctionField {
        type: "function";
        /** Either the name of the function being called, or a Function object. */
        func: Field;
        /** The arguments being passed to the function. */
        arguments: Field[];
    }
    export interface LambdaField {
        type: "lambda";
        /** An ordered list of named arguments. */
        arguments: string[];
        /** The field which should be evaluated with the arguments in context. */
        value: Field;
    }
    /** A field which indexes a variable into another variable. */
    export interface IndexField {
        type: "index";
        /** The field to index into. */
        object: Field;
        /** The index. */
        index: Field;
    }
    /** A field which negates the value of the original field. */
    export interface NegatedField {
        type: "negated";
        /** The child field to negated. */
        child: Field;
    }
    /** Utility methods for creating & comparing fields. */
    export namespace Fields {
        function variable(name: string): VariableField;
        function literal(value: Literal): LiteralField;
        function binaryOp(left: Field, op: BinaryOp, right: Field): Field;
        function index(obj: Field, index: Field): IndexField;
        /** Converts a string in dot-notation-format into a variable which indexes. */
        function indexVariable(name: string): Field;
        function lambda(args: string[], value: Field): LambdaField;
        function func(func: Field, args: Field[]): FunctionField;
        function list(values: Field[]): ListField;
        function object(values: Record<string, Field>): ObjectField;
        function negate(child: Field): NegatedField;
        function isCompareOp(op: BinaryOp): op is CompareOp;
        const NULL: LiteralField;
    }
}
declare module "data-index/source" {
    /** AST implementation for queries over data sources. */
    /** The source of files for a query. */
    export type Source = TagSource | CsvSource | FolderSource | LinkSource | EmptySource | NegatedSource | BinaryOpSource;
    /** Valid operations for combining sources. */
    export type SourceOp = "&" | "|";
    /** A tag as a source of data. */
    export interface TagSource {
        type: "tag";
        /** The tag to source from. */
        tag: string;
    }
    /** A csv as a source of data. */
    export interface CsvSource {
        type: "csv";
        /** The path to the CSV file. */
        path: string;
    }
    /** A folder prefix as a source of data. */
    export interface FolderSource {
        type: "folder";
        /** The folder prefix to source from. */
        folder: string;
    }
    /** Either incoming or outgoing links to a given file. */
    export interface LinkSource {
        type: "link";
        /** The file to look for links to/from.  */
        file: string;
        /**
         * The direction to look - if incoming, then all files linking to the target file. If outgoing, then all files
         * which the file links to.
         */
        direction: "incoming" | "outgoing";
    }
    /** A source which is everything EXCEPT the files returned by the given source. */
    export interface NegatedSource {
        type: "negate";
        /** The source to negate. */
        child: Source;
    }
    /** A source which yields nothing. */
    export interface EmptySource {
        type: "empty";
    }
    /** A source made by combining subsources with a logical operators. */
    export interface BinaryOpSource {
        type: "binaryop";
        op: SourceOp;
        left: Source;
        right: Source;
    }
    /** Utility functions for creating and manipulating sources. */
    export namespace Sources {
        /** Create a source which searches from a tag. */
        function tag(tag: string): TagSource;
        /** Create a source which fetches from a CSV file. */
        function csv(path: string): CsvSource;
        /** Create a source which searches for files under a folder prefix. */
        function folder(prefix: string): FolderSource;
        /** Create a source which searches for files which link to/from a given file. */
        function link(file: string, incoming: boolean): LinkSource;
        /** Create a source which joins two sources by a logical operator (and/or). */
        function binaryOp(left: Source, op: SourceOp, right: Source): Source;
        /** Create a source which takes the intersection of two sources. */
        function and(left: Source, right: Source): Source;
        /** Create a source which takes the union of two sources. */
        function or(left: Source, right: Source): Source;
        /** Create a source which negates the underlying source. */
        function negate(child: Source): NegatedSource;
        function empty(): EmptySource;
    }
}
declare module "expression/parse" {
    import { DateTime, Duration } from "luxon";
    import { Literal, Link } from "data-model/value";
    import * as P from "parsimmon";
    import { BinaryOp, Field, LambdaField, ListField, LiteralField, ObjectField, VariableField } from "expression/field";
    import { FolderSource, NegatedSource, Source, TagSource, CsvSource } from "data-index/source";
    import { Result } from "api/result";
    /** Provides a lookup table for unit durations of the given type. */
    export const DURATION_TYPES: {
        year: Duration;
        years: Duration;
        yr: Duration;
        yrs: Duration;
        month: Duration;
        months: Duration;
        mo: Duration;
        mos: Duration;
        week: Duration;
        weeks: Duration;
        wk: Duration;
        wks: Duration;
        w: Duration;
        day: Duration;
        days: Duration;
        d: Duration;
        hour: Duration;
        hours: Duration;
        hr: Duration;
        hrs: Duration;
        h: Duration;
        minute: Duration;
        minutes: Duration;
        min: Duration;
        mins: Duration;
        m: Duration;
        second: Duration;
        seconds: Duration;
        sec: Duration;
        secs: Duration;
        s: Duration;
    };
    /** Shorthand for common dates (relative to right now). */
    export const DATE_SHORTHANDS: {
        now: () => DateTime;
        today: () => DateTime;
        yesterday: () => DateTime;
        tomorrow: () => DateTime;
        sow: () => DateTime;
        "start-of-week": () => DateTime;
        eow: () => DateTime;
        "end-of-week": () => DateTime;
        soy: () => DateTime;
        "start-of-year": () => DateTime;
        eoy: () => DateTime;
        "end-of-year": () => DateTime;
        som: () => DateTime;
        "start-of-month": () => DateTime;
        eom: () => DateTime;
        "end-of-month": () => DateTime;
    };
    /**
     * Keywords which cannot be used as variables directly. Use `row.<thing>` if it is a variable you have defined and want
     * to access.
     */
    export const KEYWORDS: string[];
    /** Attempt to parse the inside of a link to pull out display name, subpath, etc. */
    export function parseInnerLink(rawlink: string): Link;
    /** Create a left-associative binary parser which parses the given sub-element and separator. Handles whitespace. */
    export function createBinaryParser<T, U>(child: P.Parser<T>, sep: P.Parser<U>, combine: (a: T, b: U, c: T) => T): P.Parser<T>;
    export function chainOpt<T>(base: P.Parser<T>, ...funcs: ((r: T) => P.Parser<T>)[]): P.Parser<T>;
    type PostfixFragment = {
        type: "dot";
        field: string;
    } | {
        type: "index";
        field: Field;
    } | {
        type: "function";
        fields: Field[];
    };
    interface ExpressionLanguage {
        number: number;
        string: string;
        escapeCharacter: string;
        bool: boolean;
        tag: string;
        identifier: string;
        link: Link;
        embedLink: Link;
        rootDate: DateTime;
        dateShorthand: keyof typeof DATE_SHORTHANDS;
        date: DateTime;
        datePlus: DateTime;
        durationType: keyof typeof DURATION_TYPES;
        duration: Duration;
        rawNull: string;
        binaryPlusMinus: BinaryOp;
        binaryMulDiv: BinaryOp;
        binaryCompareOp: BinaryOp;
        binaryBooleanOp: BinaryOp;
        tagSource: TagSource;
        csvSource: CsvSource;
        folderSource: FolderSource;
        parensSource: Source;
        atomSource: Source;
        linkIncomingSource: Source;
        linkOutgoingSource: Source;
        negateSource: NegatedSource;
        binaryOpSource: Source;
        source: Source;
        variableField: VariableField;
        numberField: LiteralField;
        boolField: LiteralField;
        stringField: LiteralField;
        dateField: LiteralField;
        durationField: LiteralField;
        linkField: LiteralField;
        nullField: LiteralField;
        listField: ListField;
        objectField: ObjectField;
        atomInlineField: Literal;
        inlineFieldList: Literal[];
        inlineField: Literal;
        negatedField: Field;
        atomField: Field;
        indexField: Field;
        lambdaField: LambdaField;
        dotPostfix: PostfixFragment;
        indexPostfix: PostfixFragment;
        functionPostfix: PostfixFragment;
        binaryMulDivField: Field;
        binaryPlusMinusField: Field;
        binaryCompareField: Field;
        binaryBooleanField: Field;
        binaryOpField: Field;
        parensField: Field;
        field: Field;
    }
    export const EXPRESSION: P.TypedLanguage<ExpressionLanguage>;
    /**
     * Attempt to parse a field from the given text, returning a string error if the
     * parse failed.
     */
    export function parseField(text: string): Result<Field, string>;
}
declare module "data-import/inline-field" {
    import { Literal } from "data-model/value";
    /** A parsed inline field. */
    export interface InlineField {
        /** The raw parsed key. */
        key: string;
        /** The raw value of the field. */
        value: string;
        /** The start column of the field. */
        start: number;
        /** The start column of the *value* for the field. */
        startValue: number;
        /** The end column of the field. */
        end: number;
        /** If this inline field was defined via a wrapping ('[' or '('), then the wrapping that was used. */
        wrapping?: string;
    }
    /** The wrapper characters that can be used to define an inline field. */
    export const INLINE_FIELD_WRAPPERS: Readonly<Record<string, string>>;
    /** Parse a textual inline field value into something we can work with. */
    export function parseInlineValue(value: string): Literal;
    /** Extracts inline fields of the form '[key:: value]' from a line of text. This is done in a relatively
     * "robust" way to avoid failing due to bad nesting or other interfering Markdown symbols:
     *
     * - Look for any wrappers ('[' and '(') in the line, trying to parse whatever comes after it as an inline key::.
     * - If successful, scan until you find a matching end bracket, and parse whatever remains as an inline value.
     */
    export function extractInlineFields(line: string, includeTaskFields?: boolean): InlineField[];
    /** Attempt to extract a full-line field (Key:: Value consuming the entire content line). */
    export function extractFullLineField(text: string): InlineField | undefined;
    export const CREATED_DATE_REGEX: RegExp;
    export const DUE_DATE_REGEX: RegExp;
    export const DONE_DATE_REGEX: RegExp;
    export const SCHEDULED_DATE_REGEX: RegExp;
    export const START_DATE_REGEX: RegExp;
    export const EMOJI_REGEXES: {
        regex: RegExp;
        key: string;
    }[];
    /** Sets or replaces the value of an inline field; if the value is 'undefined', deletes the key. */
    export function setInlineField(source: string, key: string, value?: string): string;
    export function setEmojiShorthandCompletionField(source: string, value?: string): string;
}
declare module "data-model/serialized/markdown" {
    /** Serialized / API facing data types for Dataview objects. */
    import { Link, Literal } from "data-model/value";
    import { DateTime } from "luxon";
    import { Pos } from "obsidian";
    export interface SMarkdownPage {
        file: {
            path: string;
            folder: string;
            name: string;
            link: Link;
            outlinks: Link[];
            inlinks: Link[];
            etags: string[];
            tags: string[];
            aliases: string[];
            lists: SListItem[];
            tasks: STask[];
            ctime: DateTime;
            cday: DateTime;
            mtime: DateTime;
            mday: DateTime;
            size: number;
            ext: string;
            starred: boolean;
            day?: DateTime;
        };
        /** Additional fields added by field data. */
        [key: string]: any;
    }
    /** A serialized list item. */
    export type SListItem = SListEntry | STask;
    /** Shared data between list items. */
    export interface SListItemBase {
        /** The symbo used to start this list item, like '1.' or '1)' or '*'. */
        symbol: string;
        /** A link to the closest thing to this list item (a block, a section, or a file). */
        link: Link;
        /** The section that contains this list item. */
        section: Link;
        /** The path of the file that contains this item. */
        path: string;
        /** The line this item starts on. */
        line: number;
        /** The number of lines this item spans. */
        lineCount: number;
        /** The internal Obsidian tracker of the exact position of this line. */
        position: Pos;
        /** The line number of the list that this item is part of. */
        list: number;
        /** If present, the block ID for this item. */
        blockId?: string;
        /** The line number of the parent item to this list, if relevant. */
        parent?: number;
        /** The children elements of this list item. */
        children: SListItem[];
        /** Links contained inside this list item. */
        outlinks: Link[];
        /** The raw text of this item. */
        text: string;
        /**
         * If present, overrides 'text' when rendered in task views. You should not mutate 'text' since it is used to
         * validate a list item when editing it.
         */
        visual?: string;
        /** Whether this item has any metadata annotations on it. */
        annotated?: boolean;
        /** Any tags present in this task. */
        tags: string[];
        /** @deprecated use 'children' instead. */
        subtasks: SListItem[];
        /** @deprecated use 'task' instead. */
        real: boolean;
        /** @deprecated use 'section' instead. */
        header: Link;
        /** Additional fields added by annotations. */
        [key: string]: any;
    }
    /** A serialized list item as seen by users; this is not a task. */
    export interface SListEntry extends SListItemBase {
        task: false;
    }
    /** A serialized task. */
    export interface STask extends SListItemBase {
        task: true;
        /** The status of this task, the text between the brackets ('[ ]'). Will be a space if the task is currently unchecked. */
        status: string;
        /** Indicates whether the task has any value other than empty space. */
        checked: boolean;
        /** Indicates whether the task explicitly has been marked "completed" ('x' or 'X'). */
        completed: boolean;
        /** Indicates whether the task and ALL subtasks have been completed. */
        fullyCompleted: boolean;
        /** If present, then the time that this task was created. */
        created?: Literal;
        /** If present, then the time that this task was due. */
        due?: Literal;
        /** If present, then the time that this task was completed. */
        completion?: Literal;
        /** If present, then the day that this task can be started. */
        start?: Literal;
        /** If present, then the day that work on this task is scheduled. */
        scheduled?: Literal;
    }
}
declare module "data-model/markdown" {
    import { DateTime } from "luxon";
    import type { FullIndex } from "data-index/index";
    import { Literal, Link } from "data-model/value";
    import { DataObject } from "index";
    import { SListItem, SMarkdownPage } from "data-model/serialized/markdown";
    import { Pos } from "obsidian";
    /** All extracted markdown file metadata obtained from a file. */
    export class PageMetadata {
        /** The path this file exists at. */
        path: string;
        /** Obsidian-provided date this page was created. */
        ctime: DateTime;
        /** Obsidian-provided date this page was modified. */
        mtime: DateTime;
        /** Obsidian-provided size of this page in bytes. */
        size: number;
        /** The day associated with this page, if relevant. */
        day?: DateTime;
        /** The first H1/H2 header in the file. May not exist. */
        title?: string;
        /** All of the fields contained in this markdown file - both frontmatter AND in-file links. */
        fields: Map<string, Literal>;
        /** All of the exact tags (prefixed with '#') in this file overall. */
        tags: Set<string>;
        /** All of the aliases defined for this file. */
        aliases: Set<string>;
        /** All OUTGOING links (including embeds, header + block links) in this file. */
        links: Link[];
        /** All list items contained within this page. Filter for tasks to get just tasks. */
        lists: ListItem[];
        /** The raw frontmatter for this document. */
        frontmatter: Record<string, Literal>;
        constructor(path: string, init?: Partial<PageMetadata>);
        /** Canonicalize raw links and other data in partial data with normalizers, returning a completed object. */
        static canonicalize(data: Partial<PageMetadata>, linkNormalizer: (link: Link) => Link): PageMetadata;
        /** The name (based on path) of this file. */
        name(): string;
        /** The containing folder (based on path) of this file. */
        folder(): string;
        /** The extension of this file (likely 'md'). */
        extension(): string;
        /** Return a set of tags AND all of their parent tags (so #hello/yes would become #hello, #hello/yes). */
        fullTags(): Set<string>;
        /** Convert all links in this file to file links. */
        fileLinks(): Link[];
        /** Map this metadata to a full object; uses the index for additional data lookups.  */
        serialize(index: FullIndex, cache?: ListSerializationCache): SMarkdownPage;
    }
    /** A list item inside of a list. */
    export class ListItem {
        /** The symbol ('*', '-', '1.') used to define this list item. */
        symbol: string;
        /** A link which points to this task, or to the closest block that this task is contained in. */
        link: Link;
        /** A link to the section that contains this list element; could be a file if this is not in a section. */
        section: Link;
        /** The text of this list item. This may be multiple lines of markdown. */
        text: string;
        /** The line that this list item starts on in the file. */
        line: number;
        /** The number of lines that define this list item. */
        lineCount: number;
        /** The line number for the first list item in the list this item belongs to. */
        list: number;
        /** Any links contained within this list item. */
        links: Link[];
        /** The tags contained within this list item. */
        tags: Set<string>;
        /** The raw Obsidian-provided position for where this task is. */
        position: Pos;
        /** The line number of the parent list item, if present; if this is undefined, this is a root item. */
        parent?: number;
        /** The line numbers of children of this list item. */
        children: number[];
        /** The block ID for this item, if one is present. */
        blockId?: string;
        /** Any fields defined in this list item. For tasks, this includes fields underneath the task. */
        fields: Map<string, Literal[]>;
        task?: {
            /** The text in between the brackets of the '[ ]' task indicator ('[X]' would yield 'X', for example.) */
            status: string;
            /** Whether or not this task has been checked in any way (it's status is not empty/space). */
            checked: boolean;
            /** Whether or not this task was completed; derived from 'status' by checking if the field 'X' or 'x'. */
            completed: boolean;
            /** Whether or not this task and all of it's subtasks are completed. */
            fullyCompleted: boolean;
        };
        constructor(init?: Partial<ListItem>);
        id(): string;
        file(): Link;
        markdown(): string;
        created(): Literal | undefined;
        due(): Literal | undefined;
        completed(): Literal | undefined;
        start(): Literal | undefined;
        scheduled(): Literal | undefined;
        /** Create an API-friendly copy of this list item. De-duplication is done via the provided cache. */
        serialize(cache: ListSerializationCache): SListItem;
    }
    /** De-duplicates list items across section metadata and page metadata. */
    export class ListSerializationCache {
        listItems: Record<number, ListItem>;
        cache: Record<number, SListItem>;
        seen: Set<number>;
        constructor(listItems: ListItem[]);
        get(lineno: number): SListItem | undefined;
    }
    export function addFields(fields: Map<string, Literal[]>, target: DataObject): DataObject;
}
declare module "data-import/common" {
    /** Extract all tags from the given source string. */
    export function extractTags(source: string): Set<string>;
}
declare module "data-import/markdown-file" {
    /** Importer for markdown documents. */
    import { InlineField } from "data-import/inline-field";
    import { ListItem, PageMetadata } from "data-model/markdown";
    import { Literal, Link } from "data-model/value";
    import { CachedMetadata, FileStats, FrontMatterCache, HeadingCache } from "obsidian";
    /** Extract markdown metadata from the given Obsidian markdown file. */
    export function parsePage(path: string, contents: string, stat: FileStats, metadata: CachedMetadata): PageMetadata;
    /** Extract tags intelligently from frontmatter. Handles arrays, numbers, and strings. */
    export function extractTags(metadata: FrontMatterCache): string[];
    /** Extract aliases intelligently from frontmatter. Handles arrays, numbers, and strings.  */
    export function extractAliases(metadata: FrontMatterCache): string[];
    /** Split a frontmatter list into separate elements; handles actual lists, comma separated lists, and single elements. */
    export function splitFrontmatterTagOrAlias(data: any, on: RegExp): string[];
    /** Parse raw (newline-delimited) markdown, returning inline fields, list items, and other metadata. */
    export function parseMarkdown(path: string, contents: string[], metadata: CachedMetadata, linksByLine: Record<number, Link[]>): {
        fields: Map<string, Literal[]>;
        lists: ListItem[];
    };
    export const LIST_ITEM_REGEX: RegExp;
    /**
     * Parse list items from the page + metadata. This requires some additional parsing above whatever Obsidian provides,
     * since Obsidian only gives line numbers.
     */
    export function parseLists(path: string, content: string[], metadata: CachedMetadata, linksByLine: Record<number, Link[]>): [ListItem[], Map<string, Literal[]>];
    /** Recursively convert frontmatter into fields. We have to dance around YAML structure. */
    export function parseFrontmatter(value: any): Literal;
    /** Add a parsed inline field to the output map. */
    export function addRawInlineField(field: InlineField, output: Map<string, Literal[]>): void;
    /** Add a raw inline field to an output map, canonicalizing as needed. */
    export function addInlineField(key: string, value: Literal, output: Map<string, Literal[]>): void;
    /** Given a raw list of inline field values, add normalized keys and squash them. */
    export function finalizeInlineFields(fields: Map<string, Literal[]>): Map<string, Literal>;
    /** Copy all fields of 'source' into 'target'. */
    export function mergeFieldGroups(target: Map<string, Literal[]>, source: Map<string, Literal[]>): void;
    /** Find the header that is most immediately above the given line number. */
    export function findPreviousHeader(line: number, headers: HeadingCache[]): string | undefined;
}
declare module "data-import/csv" {
    import { DataObject } from "data-model/value";
    /** Parse a CSV file into a collection of data rows. */
    export function parseCsv(content: string): DataObject[];
}
declare module "data-model/transferable" {
    /** Simplifies passing dataview values across the JS web worker barrier. */
    export namespace Transferable {
        /** Convert a literal value to a serializer-friendly transferable value. */
        function transferable(value: any): any;
        /** Convert a transferable value back to a literal value we can work with. */
        function value(transferable: any): any;
    }
}
declare module "data-import/persister" {
    import { PageMetadata } from "data-model/markdown";
    /** A piece of data that has been cached for a specific version and time. */
    export interface Cached<T> {
        /** The version of Dataview that the data was written to cache with. */
        version: string;
        /** The time that the data was written to cache. */
        time: number;
        /** The data that was cached. */
        data: T;
    }
    /** Simpler wrapper for a file-backed cache for arbitrary metadata. */
    export class LocalStorageCache {
        appId: string;
        version: string;
        persister: LocalForage;
        constructor(appId: string, version: string);
        /** Drop the entire cache instance and re-create a new fresh instance. */
        recreate(): Promise<void>;
        /** Load file metadata by path. */
        loadFile(path: string): Promise<Cached<Partial<PageMetadata>> | null | undefined>;
        /** Store file metadata by path. */
        storeFile(path: string, data: Partial<PageMetadata>): Promise<void>;
        /** Drop old file keys that no longer exist. */
        synchronize(existing: string[] | Set<string>): Promise<Set<string>>;
        /** Obtain a list of all metadata keys. */
        allKeys(): Promise<string[]>;
        /** Obtain a list of all persisted files. */
        allFiles(): Promise<string[]>;
        fileKey(path: string): string;
    }
}
declare module "data-import/web-worker/import-manager" {
    import { Component, MetadataCache, TFile, Vault } from "obsidian";
    /** Callback when a file is resolved. */
    type FileCallback = (p: any) => void;
    /** Multi-threaded file parser which debounces rapid file requests automatically. */
    export class FileImporter extends Component {
        numWorkers: number;
        vault: Vault;
        metadataCache: MetadataCache;
        workers: Worker[];
        /** Tracks which workers are actively parsing a file, to make sure we properly delegate results. */
        busy: boolean[];
        /** List of files which have been queued for a reload. */
        reloadQueue: TFile[];
        /** Fast-access set which holds the list of files queued to be reloaded; used for debouncing. */
        reloadSet: Set<string>;
        /** Paths -> promises for file reloads which have not yet been queued. */
        callbacks: Map<string, [FileCallback, FileCallback][]>;
        constructor(numWorkers: number, vault: Vault, metadataCache: MetadataCache);
        /**
         * Queue the given file for reloading. Multiple reload requests for the same file in a short time period will be de-bounced
         * and all be resolved by a single actual file reload.
         */
        reload<T>(file: TFile): Promise<T>;
        /** Finish the parsing of a file, potentially queueing a new file. */
        private finish;
        /** Send a new task to the given worker ID. */
        private send;
        /** Find the next available, non-busy worker; return undefined if all workers are busy. */
        private nextAvailableWorker;
    }
}
declare module "data-index/index" {
    /** Stores various indices on all files in the vault to make dataview generation fast. */
    import { Result } from "api/result";
    import { LocalStorageCache } from "data-import/persister";
    import { FileImporter } from "data-import/web-worker/import-manager";
    import { PageMetadata } from "data-model/markdown";
    import { DataObject } from "data-model/value";
    import { DateTime } from "luxon";
    import { App, Component, MetadataCache, TAbstractFile, TFile, Vault } from "obsidian";
    /** Aggregate index which has several sub-indices and will initialize all of them. */
    export class FullIndex extends Component {
        app: App;
        indexVersion: string;
        onChange: () => void;
        /** Generate a full index from the given vault. */
        static create(app: App, indexVersion: string, onChange: () => void): FullIndex;
        /** Whether all files in the vault have been indexed at least once. */
        initialized: boolean;
        /** I/O access to the Obsidian vault contents. */
        vault: Vault;
        /** Access to in-memory metadata, useful for parsing and metadata lookups. */
        metadataCache: MetadataCache;
        /** Persistent IndexedDB backing store, used for faster startup. */
        persister: LocalStorageCache;
        pages: Map<string, PageMetadata>;
        /** Map files -> tags in that file, and tags -> files. This version includes subtags. */
        tags: ValueCaseInsensitiveIndexMap;
        /** Map files -> exact tags in that file, and tags -> files. This version does not automatically add subtags. */
        etags: ValueCaseInsensitiveIndexMap;
        /** Map files -> linked files in that file, and linked file -> files that link to it. */
        links: IndexMap;
        /** Search files by path prefix. */
        prefix: PrefixIndex;
        /** Allows for efficient lookups of whether a file is starred or not. */
        starred: StarredCache;
        /** Caches data in CSV files. */
        csv: CsvCache;
        /**
         * The current "revision" of the index, which monotonically increases for every index change. Use this to determine
         * if you are up to date.
         */
        revision: number;
        /** Asynchronously parses files in the background using web workers. */
        importer: FileImporter;
        /** Construct a new index using the app data and a current data version. */
        private constructor();
        /** Trigger a metadata event on the metadata cache. */
        private trigger;
        /** "Touch" the index, incrementing the revision number and causing downstream views to reload. */
        touch(): void;
        /** Runs through the whole vault to set up initial file metadata. */
        initialize(): void;
        /** Drops the local storage cache and re-indexes all files; this should generally be used if you expect cache issues. */
        reinitialize(): Promise<void>;
        /** Internal asynchronous initializer. */
        private _initialize;
        rename(file: TAbstractFile, oldPath: string): void;
        /** Queue a file for reloading; this is done asynchronously in the background and may take a few seconds. */
        reload(file: TFile): Promise<{
            cached: boolean;
            skipped: boolean;
        }>;
        /** Import a file directly from disk, skipping the cache. */
        private import;
        /** Finish the reloading of file metadata by adding it to in memory indexes. */
        private finish;
    }
    /** Indexes files by their full prefix - essentially a simple prefix tree. */
    export class PrefixIndex extends Component {
        vault: Vault;
        updateRevision: () => void;
        static create(vault: Vault, updateRevision: () => void): PrefixIndex;
        constructor(vault: Vault, updateRevision: () => void);
        private walk;
        /** Get the list of all files under the given path. */
        get(prefix: string, filter?: (path: string) => boolean): Set<string>;
        /** Determines if the given path exists in the prefix index. */
        pathExists(path: string): boolean;
        /** Determines if the given prefix exists in the prefix index. */
        nodeExists(prefix: string): boolean;
        /**
         * Use the in-memory prefix index to convert a relative path to an absolute one.
         */
        resolveRelative(path: string, origin?: string): string;
    }
    /** Simple path filters which filter file types. */
    export namespace PathFilters {
        function csv(path: string): boolean;
        function markdown(path: string): boolean;
    }
    /**
     * Caches in-use CSVs to make high-frequency reloads (such as actively looking at a document
     * that uses CSV) fast.
     */
    export class CsvCache extends Component {
        vault: Vault;
        static CACHE_EXPIRY_SECONDS: number;
        cache: Map<string, {
            data: DataObject[];
            loadTime: DateTime;
        }>;
        cacheClearInterval: number;
        constructor(vault: Vault);
        /** Load a CSV file from the cache, doing a fresh load if it has not been loaded. */
        get(path: string): Promise<Result<DataObject[], string>>;
        /** Do the actual raw loading of a CSV path (which is either local or an HTTP request). */
        private loadInternal;
        /** Clear old entries in the cache (as measured by insertion time). */
        private clearOldEntries;
    }
    export type StarredEntry = {
        type: "file";
        path: string;
        title: string;
    } | {
        type: "folder";
    } | {
        type: "query";
    };
    /** Optional connector to the Obsidian 'Starred' plugin which allows for efficiently querying if a file is starred or not. */
    export class StarredCache extends Component {
        app: App;
        onUpdate: () => void;
        /** Initial delay before checking the cache; we need to wait for it to asynchronously load the initial stars. */
        static INITIAL_DELAY: number;
        /** How frequently to check for star updates. */
        static REFRESH_INTERVAL: number;
        /** Set of all starred file paths. */
        private stars;
        constructor(app: App, onUpdate: () => void);
        /** Determines if the given path is starred. */
        starred(path: string): boolean;
        private reload;
        /** Fetch all starred files from the stars plugin, if present. */
        private static fetch;
    }
    /** A generic index which indexes variables of the form key -> value[], allowing both forward and reverse lookups. */
    export class IndexMap {
        /** Maps key -> values for that key. */
        map: Map<string, Set<string>>;
        /** Cached inverse map; maps value -> keys that reference that value. */
        invMap: Map<string, Set<string>>;
        /** Create a new, empty index map. */
        constructor();
        /** Returns all values for the given key. */
        get(key: string): Set<string>;
        /** Returns all keys that reference the given key. Mutating the returned set is not allowed. */
        getInverse(value: string): Readonly<Set<string>>;
        /** Sets the key to the given values; this will delete the old mapping for the key if one was present. */
        set(key: string, values: Set<string>): this;
        /** Clears all values for the given key so they can be re-added. */
        delete(key: string): boolean;
        /** Rename all references to the given key to a new value. */
        rename(oldKey: string, newKey: string): boolean;
        /** Clear the entire index. */
        clear(): void;
        static EMPTY_SET: Readonly<Set<string>>;
    }
    /** Index map wrapper which is case-insensitive in the key. */
    export class ValueCaseInsensitiveIndexMap {
        delegate: IndexMap;
        /** Create a new, empty case insensitive index map. */
        constructor(delegate?: IndexMap);
        /** Returns all values for the given key. */
        get(key: string): Set<string>;
        /** Returns all keys that reference the given value. Mutating the returned set is not allowed. */
        getInverse(value: string): Readonly<Set<string>>;
        /** Sets the key to the given values; this will delete the old mapping for the key if one was present. */
        set(key: string, values: Set<string>): this;
        /** Clears all values for the given key so they can be re-added. */
        delete(key: string): boolean;
        /** Rename all references to the given key to a new value. */
        rename(oldKey: string, newKey: string): boolean;
        /** Clear the entire index. */
        clear(): void;
    }
}
declare module "data-index/resolver" {
    /** Collect data matching a source query. */
    import { FullIndex } from "data-index/index";
    import { Result } from "api/result";
    import { Source } from "data-index/source";
    import { DataObject, Literal } from "data-model/value";
    /** A data row which has an ID and associated data (like page link / page data). */
    export type Datarow<T> = {
        id: Literal;
        data: T;
    };
    /** Find source paths which match the given source. */
    export function matchingSourcePaths(source: Source, index: FullIndex, originFile?: string): Result<Set<string>, string>;
    /** Convert a path to the data for that path; usually markdown pages, but could also be other file types (like CSV).  */
    export function resolvePathData(path: string, index: FullIndex): Promise<Result<Datarow<DataObject>[], string>>;
    /** Convert a CSV path to the data in the CSV (in dataview format). */
    export function resolveCsvData(path: string, index: FullIndex): Promise<Result<Datarow<DataObject>[], string>>;
    /** Convert a path pointing to a markdown page, into the associated metadata. */
    export function resolveMarkdownData(path: string, index: FullIndex): Result<Datarow<DataObject>[], string>;
    /** Resolve a source to the collection of data rows that it matches. */
    export function resolveSource(source: Source, index: FullIndex, originFile?: string): Promise<Result<Datarow<DataObject>[], string>>;
}
declare module "api/data-array" {
    import { QuerySettings } from "settings";
    /** A function which maps an array element to some value. */
    export type ArrayFunc<T, O> = (elem: T, index: number, arr: T[]) => O;
    /** A function which compares two types. */
    export type ArrayComparator<T> = (a: T, b: T) => number;
    /** Finds the value of the lowest value type in a grouping. */
    export type LowestKey<T> = T extends {
        key: any;
        rows: any;
    } ? LowestKey<T["rows"][0]> : T;
    /** A ridiculous type which properly types the result of the 'groupIn' command. */
    export type Ingrouped<U, T> = T extends {
        key: any;
        rows: any;
    } ? {
        key: T["key"];
        rows: Ingrouped<U, T["rows"][0]>;
    } : {
        key: U;
        rows: T[];
    };
    /**
     * Proxied interface which allows manipulating array-based data. All functions on a data array produce a NEW array
     * (i.e., the arrays are immutable).
     */
    export interface DataArray<T> {
        /** The total number of elements in the array. */
        length: number;
        /** Filter the data array down to just elements which match the given predicate. */
        where(predicate: ArrayFunc<T, boolean>): DataArray<T>;
        /** Alias for 'where' for people who want array semantics. */
        filter(predicate: ArrayFunc<T, boolean>): DataArray<T>;
        /** Map elements in the data array by applying a function to each. */
        map<U>(f: ArrayFunc<T, U>): DataArray<U>;
        /** Map elements in the data array by applying a function to each, then flatten the results to produce a new array. */
        flatMap<U>(f: ArrayFunc<T, U[]>): DataArray<U>;
        /** Mutably change each value in the array, returning the same array which you can further chain off of. */
        mutate(f: ArrayFunc<T, void>): DataArray<T>;
        /** Limit the total number of entries in the array to the given value. */
        limit(count: number): DataArray<T>;
        /**
         * Take a slice of the array. If `start` is undefined, it is assumed to be 0; if `end` is undefined, it is assumbed
         * to be the end of the array.
         */
        slice(start?: number, end?: number): DataArray<T>;
        /** Concatenate the values in this data array with those of another iterable / data array / array. */
        concat(other: Iterable<T>): DataArray<T>;
        /** Return the first index of the given (optionally starting the search) */
        indexOf(element: T, fromIndex?: number): number;
        /** Return the first element that satisfies the given predicate. */
        find(pred: ArrayFunc<T, boolean>): T | undefined;
        /** Find the index of the first element that satisfies the given predicate. Returns -1 if nothing was found. */
        findIndex(pred: ArrayFunc<T, boolean>, fromIndex?: number): number;
        /** Returns true if the array contains the given element, and false otherwise. */
        includes(element: T): boolean;
        /**
         * Return a string obtained by converting each element in the array to a string, and joining it with the
         * given separator (which defaults to ', ').
         */
        join(sep?: string): string;
        /**
         * Return a sorted array sorted by the given key; an optional comparator can be provided, which will
         * be used to compare the keys in leiu of the default dataview comparator.
         */
        sort<U>(key: ArrayFunc<T, U>, direction?: "asc" | "desc", comparator?: ArrayComparator<U>): DataArray<T>;
        /**
         * Mutably modify the current array with an in place sort; this is less flexible than a regular sort in exchange
         * for being a little more performant. Only use this is performance is a serious consideration.
         */
        sortInPlace<U>(key: (v: T) => U, direction?: "asc" | "desc", comparator?: ArrayComparator<U>): DataArray<T>;
        /**
         * Return an array where elements are grouped by the given key; the resulting array will have objects of the form
         * { key: <key value>, rows: DataArray }.
         */
        groupBy<U>(key: ArrayFunc<T, U>, comparator?: ArrayComparator<U>): DataArray<{
            key: U;
            rows: DataArray<T>;
        }>;
        /**
         * If the array is not grouped, groups it as `groupBy` does; otherwise, groups the elements inside each current
         * group. This allows for top-down recursive grouping which may be easier than bottom-up grouping.
         */
        groupIn<U>(key: ArrayFunc<LowestKey<T>, U>, comparator?: ArrayComparator<U>): DataArray<Ingrouped<U, T>>;
        /**
         * Return distinct entries. If a key is provided, then rows with distinct keys are returned.
         */
        distinct<U>(key?: ArrayFunc<T, U>, comparator?: ArrayComparator<U>): DataArray<T>;
        /** Return true if the predicate is true for all values. */
        every(f: ArrayFunc<T, boolean>): boolean;
        /** Return true if the predicate is true for at least one value. */
        some(f: ArrayFunc<T, boolean>): boolean;
        /** Return true if the predicate is FALSE for all values. */
        none(f: ArrayFunc<T, boolean>): boolean;
        /** Return the first element in the data array. Returns undefined if the array is empty. */
        first(): T;
        /** Return the last element in the data array. Returns undefined if the array is empty. */
        last(): T;
        /** Map every element in this data array to the given key, and then flatten it.*/
        to(key: string): DataArray<any>;
        /** Map every element in this data array to the given key; unlike to(), does not flatten the result. */
        into(key: string): DataArray<any>;
        /**
         * Recursively expand the given key, flattening a tree structure based on the key into a flat array. Useful for handling
         * heirarchical data like tasks with 'subtasks'.
         */
        expand(key: string): DataArray<any>;
        /** Run a lambda on each element in the array. */
        forEach(f: ArrayFunc<T, void>): void;
        /** Convert this to a plain javascript array. */
        array(): T[];
        /** Allow iterating directly over the array. */
        [Symbol.iterator](): Iterator<T>;
        /** Map indexes to values. */
        [index: number]: any;
        /** Automatic flattening of fields. Equivalent to implicitly calling `array.to("field")` */
        [field: string]: any;
    }
    /** Provides utility functions for generating data arrays. */
    export namespace DataArray {
        /** Create a new Dataview data array. */
        function wrap<T>(raw: T[] | DataArray<T>, settings: QuerySettings): DataArray<T>;
        /** Create a new DataArray from an iterable object. */
        function from<T>(raw: Iterable<T>, settings: QuerySettings): DataArray<T>;
        /** Return true if the given object is a data array. */
        function isDataArray(obj: any): obj is DataArray<any>;
    }
}
declare module "util/locale" {
    /** Test-environment-friendly function which fetches the current system locale. */
    export function currentLocale(): string;
}
declare module "ui/render" {
    import { Component } from "obsidian";
    import { QuerySettings } from "settings";
    import { Literal } from "data-model/value";
    /** Render simple fields compactly, removing wrapping content like paragraph and span. */
    export function renderCompactMarkdown(markdown: string, container: HTMLElement, sourcePath: string, component: Component): Promise<void>;
    /** Render a pre block with an error in it; returns the element to allow for dynamic updating. */
    export function renderErrorPre(container: HTMLElement, error: string): HTMLElement;
    /** Render a static codeblock. */
    export function renderCodeBlock(container: HTMLElement, source: string, language?: string): HTMLElement;
    export type ValueRenderContext = "root" | "list";
    /** Prettily render a value into a container with the given settings. */
    export function renderValue(field: Literal, container: HTMLElement, originFile: string, component: Component, settings: QuerySettings, expandList?: boolean, context?: ValueRenderContext, depth?: number): Promise<void>;
}
declare module "expression/context" {
    /** Core implementation of the query language evaluation engine. */
    import { Literal } from "data-model/value";
    import { Result } from "api/result";
    import { BinaryOpHandler } from "expression/binaryop";
    import { Field } from "expression/field";
    import { FunctionImpl } from "expression/functions";
    import { QuerySettings } from "settings";
    /** Handles link resolution and normalization inside of a context. */
    export interface LinkHandler {
        /** Resolve a link to the metadata it contains. */
        resolve(path: string): Record<string, Literal> | null;
        /**
         * Normalize a link to it's fully-qualified path for comparison purposes.
         * If the path does not exist, returns it unchanged.
         */
        normalize(path: string): string;
        /** Return true if the given path actually exists, false otherwise. */
        exists(path: string): boolean;
    }
    /**
     * Evaluation context that expressions can be evaluated in. Includes global state, as well as available functions and a handler
     * for binary operators.
     */
    export class Context {
        linkHandler: LinkHandler;
        settings: QuerySettings;
        globals: Record<string, Literal>;
        binaryOps: BinaryOpHandler;
        functions: Record<string, FunctionImpl>;
        /**
         * Create a new context with the given namespace of globals, as well as optionally with custom binary operator, function,
         * and link handlers.
         */
        constructor(linkHandler: LinkHandler, settings: QuerySettings, globals?: Record<string, Literal>, binaryOps?: BinaryOpHandler, functions?: Record<string, FunctionImpl>);
        /** Set a global value in this context. */
        set(name: string, value: Literal): Context;
        /** Get the value of a global variable by name. Returns null if not present. */
        get(name: string): Literal;
        /** Try to evaluate an arbitary field in this context, raising an exception on failure. */
        tryEvaluate(field: Field, data?: Record<string, Literal>): Literal;
        /** Evaluate an arbitrary field in this context. */
        evaluate(field: Field, data?: Record<string, Literal>): Result<Literal, string>;
    }
}
declare module "expression/binaryop" {
    /** Provides a global dispatch table for evaluating binary operators, including comparison. */
    import { LiteralRepr, LiteralType, Literal } from "data-model/value";
    import { Result } from "api/result";
    import { BinaryOp } from "expression/field";
    import type { Context } from "expression/context";
    /** A literal type or a catch-all '*'. */
    export type LiteralTypeOrAll = LiteralType | "*";
    /** Maps a literal type or the catch-all '*'. */
    export type LiteralReprAll<T extends LiteralTypeOrAll> = T extends "*" ? Literal : T extends LiteralType ? LiteralRepr<T> : any;
    /** An implementation for a binary operator. */
    export type BinaryOpImpl<A extends Literal, B extends Literal> = (first: A, second: B, ctx: Context) => Literal;
    /** An implementation of a comparator (returning a number) which then automatically defines all of the comparison operators. */
    export type CompareImpl<T extends Literal> = (first: T, second: T, ctx: Context) => number;
    /** Provides implementations for binary operators on two types using a registry. */
    export class BinaryOpHandler {
        private map;
        static create(): BinaryOpHandler;
        constructor();
        register<T extends LiteralTypeOrAll, U extends LiteralTypeOrAll>(left: T, op: BinaryOp, right: U, func: BinaryOpImpl<LiteralReprAll<T>, LiteralReprAll<U>>): BinaryOpHandler;
        registerComm<T extends LiteralTypeOrAll, U extends LiteralTypeOrAll>(left: T, op: BinaryOp, right: U, func: BinaryOpImpl<LiteralReprAll<T>, LiteralReprAll<U>>): BinaryOpHandler;
        /** Implement a comparison function. */
        compare<T extends LiteralTypeOrAll>(type: T, compare: CompareImpl<LiteralReprAll<T>>): BinaryOpHandler;
        /** Attempt to evaluate the given binary operator on the two literal fields. */
        evaluate(op: BinaryOp, left: Literal, right: Literal, ctx: Context): Result<Literal, string>;
        /** Create a string representation of the given triplet for unique lookup in the map. */
        static repr(op: BinaryOp, left: LiteralTypeOrAll, right: LiteralTypeOrAll): string;
    }
    /** Configure and create a binary OP handler with the given parameters. */
    export function createBinaryOps(linkNormalizer: (x: string) => string): BinaryOpHandler;
}
declare module "expression/functions" {
    import { Literal } from "data-model/value";
    import { LiteralReprAll, LiteralTypeOrAll } from "expression/binaryop";
    import type { Context } from "expression/context";
    /**
     * A function implementation which takes in a function context and a variable number of arguments. Throws an error if an
     * invalid number/type of arguments are passed.
     */
    export type FunctionImpl = (context: Context, ...rest: Literal[]) => Literal;
    /** A "bound" function implementation which has already had a function context passed to it. */
    export type BoundFunctionImpl = (...args: Literal[]) => Literal;
    /** A function variant used in the function builder which holds the argument types. */
    interface FunctionVariant {
        args: LiteralTypeOrAll[];
        varargs: boolean;
        /** The implementing function for this specific variant. */
        impl: FunctionImpl;
    }
    /**
     * Allows for the creation of functions that check the number and type of their arguments, and dispatch
     * to different implemenations based on the types of the inputs.
     */
    export class FunctionBuilder {
        name: string;
        variants: FunctionVariant[];
        vectorized: Record<number, number[]>;
        constructor(name: string);
        /** Add a general function variant which accepts any number of arguments of any type. */
        vararg(impl: FunctionImpl): FunctionBuilder;
        /** Add a function variant which takes in a single argument. */
        add1<T extends LiteralTypeOrAll>(argType: T, impl: (a: LiteralReprAll<T>, context: Context) => Literal): FunctionBuilder;
        /** Add a function variant which takes in two typed arguments. */
        add2<T extends LiteralTypeOrAll, U extends LiteralTypeOrAll>(arg1: T, arg2: U, impl: (a: LiteralReprAll<T>, b: LiteralReprAll<U>, context: Context) => Literal): FunctionBuilder;
        /** Add a function variant which takes in three typed arguments. */
        add3<T extends LiteralTypeOrAll, U extends LiteralTypeOrAll, V extends LiteralTypeOrAll>(arg1: T, arg2: U, arg3: V, impl: (a: LiteralReprAll<T>, b: LiteralReprAll<U>, c: LiteralReprAll<V>, context: Context) => Literal): FunctionBuilder;
        /** Add vectorized variants which accept the given number of arguments and delegate. */
        vectorize(numArgs: number, positions: number[]): FunctionBuilder;
        /** Return a function which checks the number and type of arguments, passing them on to the first matching variant. */
        build(): FunctionImpl;
    }
    /** Utilities for managing function implementations. */
    export namespace Functions {
        /** Bind a context to a function implementation, yielding a function which does not need the context argument. */
        function bind(func: FunctionImpl, context: Context): BoundFunctionImpl;
        /** Bind a context to all functions in the given map, yielding a new map of bound functions. */
        function bindAll(funcs: Record<string, FunctionImpl>, context: Context): Record<string, BoundFunctionImpl>;
    }
    /**
     * Collection of all defined functions; defined here so that they can be called from within dataview,
     * and test code.
     */
    export namespace DefaultFunctions {
        const typeOf: FunctionImpl;
        /** Compute the length of a data type. */
        const length: FunctionImpl;
        /** List constructor function. */
        const list: FunctionImpl;
        /** Object constructor function. */
        const object: FunctionImpl;
        /** Internal link constructor function. */
        const link: FunctionImpl;
        /** Embed and un-embed a link. */
        const embed: FunctionImpl;
        /** External link constructor function. */
        const elink: FunctionImpl;
        /** Date constructor function. */
        const date: FunctionImpl;
        /** Duration constructor function. */
        const dur: FunctionImpl;
        /** Format a date using a luxon/moment-style date format. */
        const dateformat: FunctionImpl;
        const localtime: FunctionImpl;
        /** Number constructor function. */
        const number: FunctionImpl;
        /**
         * Convert any value to a reasonable internal string representation. Most useful for dates, strings, numbers, and
         * so on.
         */
        const string: FunctionImpl;
        const round: FunctionImpl;
        const min: FunctionImpl;
        const max: FunctionImpl;
        const minby: FunctionImpl;
        const maxby: FunctionImpl;
        const striptime: FunctionImpl;
        const contains: FunctionImpl;
        const icontains: FunctionImpl;
        const econtains: FunctionImpl;
        const containsword: FunctionImpl;
        /** Extract 0 or more keys from a given object via indexing. */
        const extract: FunctionImpl;
        const reverse: FunctionImpl;
        const sort: FunctionImpl;
        const regexmatch: FunctionImpl;
        const regexreplace: FunctionImpl;
        const lower: FunctionImpl;
        const upper: FunctionImpl;
        const replace: FunctionImpl;
        /** Split a string on a given string. */
        const split: FunctionImpl;
        const startswith: FunctionImpl;
        const endswith: FunctionImpl;
        const padleft: FunctionImpl;
        const padright: FunctionImpl;
        const substring: FunctionImpl;
        const truncate: FunctionImpl;
        const fdefault: FunctionImpl;
        const ldefault: FunctionImpl;
        const choice: FunctionImpl;
        const reduce: FunctionImpl;
        const sum: FunctionImpl;
        const product: FunctionImpl;
        const join: FunctionImpl;
        const any: FunctionImpl;
        const all: FunctionImpl;
        const none: FunctionImpl;
        const filter: FunctionImpl;
        const map: FunctionImpl;
        const nonnull: FunctionImpl;
        /** Gets an object containing a link's own properties */
        const meta: FunctionImpl;
    }
    /** Default function implementations for the expression evaluator. */
    export const DEFAULT_FUNCTIONS: Record<string, FunctionImpl>;
}
declare module "query/query" {
    /** Provides an AST for complex queries. */
    import { Source } from "data-index/source";
    import { Field } from "expression/field";
    /** The supported query types (corresponding to view types). */
    export type QueryType = "list" | "table" | "task" | "calendar";
    /** Fields used in the query portion. */
    export interface NamedField {
        /** The effective name of this field. */
        name: string;
        /** The value of this field. */
        field: Field;
    }
    /** A query sort by field, for determining sort order. */
    export interface QuerySortBy {
        /** The field to sort on. */
        field: Field;
        /** The direction to sort in. */
        direction: "ascending" | "descending";
    }
    /** Utility functions for quickly creating fields. */
    export namespace QueryFields {
        function named(name: string, field: Field): NamedField;
        function sortBy(field: Field, dir: "ascending" | "descending"): QuerySortBy;
    }
    /** A query which should render a list of elements. */
    export interface ListQuery {
        type: "list";
        /** What should be rendered in the list. */
        format?: Field;
        /** If true, show the default DI field; otherwise, don't. */
        showId: boolean;
    }
    /** A query which renders a table of elements. */
    export interface TableQuery {
        type: "table";
        /** The fields (computed or otherwise) to select. */
        fields: NamedField[];
        /** If true, show the default ID field; otherwise, don't. */
        showId: boolean;
    }
    /** A query which renders a collection of tasks. */
    export interface TaskQuery {
        type: "task";
    }
    /** A query which renders a collection of notes in a calendar view. */
    export interface CalendarQuery {
        type: "calendar";
        /** The date field that we'll be grouping notes by for the calendar view */
        field: NamedField;
    }
    export type QueryHeader = ListQuery | TableQuery | TaskQuery | CalendarQuery;
    /** A step which only retains rows whose 'clause' field is truthy. */
    export interface WhereStep {
        type: "where";
        clause: Field;
    }
    /** A step which sorts all current rows by the given list of sorts. */
    export interface SortByStep {
        type: "sort";
        fields: QuerySortBy[];
    }
    /** A step which truncates the number of rows to the given amount. */
    export interface LimitStep {
        type: "limit";
        amount: Field;
    }
    /** A step which flattens rows into multiple child rows. */
    export interface FlattenStep {
        type: "flatten";
        field: NamedField;
    }
    /** A step which groups rows into groups by the given field. */
    export interface GroupStep {
        type: "group";
        field: NamedField;
    }
    /** A virtual step which extracts an array of values from each row. */
    export interface ExtractStep {
        type: "extract";
        fields: Record<string, Field>;
    }
    export type QueryOperation = WhereStep | SortByStep | LimitStep | FlattenStep | GroupStep | ExtractStep;
    /**
     * A query over the Obsidian database. Queries have a specific and deterministic execution order:
     */
    export interface Query {
        /** The view type to render this query in. */
        header: QueryHeader;
        /** The source that file candidates will come from. */
        source: Source;
        /** The operations to apply to the data to produce the final result that will be rendered. */
        operations: QueryOperation[];
    }
}
declare module "query/engine" {
    /**
     * Takes a full query and a set of indices, and (hopefully quickly) returns all relevant files.
     */
    import { FullIndex } from "data-index/index";
    import { Context, LinkHandler } from "expression/context";
    import { Datarow } from "data-index/resolver";
    import { DataObject, Link, Literal, Grouping } from "data-model/value";
    import { Query, QueryOperation } from "query/query";
    import { Result } from "api/result";
    import { Field } from "expression/field";
    import { QuerySettings } from "settings";
    import { DateTime } from "luxon";
    import { SListItem } from "data-model/serialized/markdown";
    /** Operation diagnostics collected during the execution of each query step. */
    export interface OperationDiagnostics {
        timeMs: number;
        incomingRows: number;
        outgoingRows: number;
        errors: {
            index: number;
            message: string;
        }[];
    }
    /** The meaning of the 'id' field for a data row - i.e., where it came from. */
    export type IdentifierMeaning = {
        type: "group";
        name: string;
        on: IdentifierMeaning;
    } | {
        type: "path";
    };
    /** A data row over an object. */
    export type Pagerow = Datarow<DataObject>;
    /** An error during execution. */
    export type ExecutionError = {
        index: number;
        message: string;
    };
    /** The result of executing query operations over incoming data rows; includes timing and error information. */
    export interface CoreExecution {
        data: Pagerow[];
        idMeaning: IdentifierMeaning;
        timeMs: number;
        ops: QueryOperation[];
        diagnostics: OperationDiagnostics[];
    }
    /** Shared execution code which just takes in arbitrary data, runs operations over it, and returns it + per-row errors. */
    export function executeCore(rows: Pagerow[], context: Context, ops: QueryOperation[]): Result<CoreExecution, string>;
    /** Expanded version of executeCore which adds an additional "extraction" step to the pipeline. */
    export function executeCoreExtract(rows: Pagerow[], context: Context, ops: QueryOperation[], fields: Record<string, Field>): Result<CoreExecution, string>;
    export interface ListExecution {
        core: CoreExecution;
        data: Literal[];
        primaryMeaning: IdentifierMeaning;
    }
    /** Execute a list-based query, returning the final results. */
    export function executeList(query: Query, index: FullIndex, origin: string, settings: QuerySettings): Promise<Result<ListExecution, string>>;
    /** Result of executing a table query. */
    export interface TableExecution {
        core: CoreExecution;
        names: string[];
        data: Literal[][];
        idMeaning: IdentifierMeaning;
    }
    /** Execute a table query. */
    export function executeTable(query: Query, index: FullIndex, origin: string, settings: QuerySettings): Promise<Result<TableExecution, string>>;
    /** The result of executing a task query. */
    export interface TaskExecution {
        core: CoreExecution;
        tasks: Grouping<SListItem>;
    }
    /** Execute a task query, returning all matching tasks. */
    export function executeTask(query: Query, origin: string, index: FullIndex, settings: QuerySettings): Promise<Result<TaskExecution, string>>;
    /** Execute a single field inline a file, returning the evaluated result. */
    export function executeInline(field: Field, origin: string, index: FullIndex, settings: QuerySettings): Result<Literal, string>;
    /** The default link resolver used when creating contexts. */
    export function defaultLinkHandler(index: FullIndex, origin: string): LinkHandler;
    /** Execute a calendar-based query, returning the final results. */
    export function executeCalendar(query: Query, index: FullIndex, origin: string, settings: QuerySettings): Promise<Result<CalendarExecution, string>>;
    export interface CalendarExecution {
        core: CoreExecution;
        data: {
            date: DateTime;
            link: Link;
            value?: Literal[];
        }[];
    }
}
declare module "util/media" {
    import { Link } from "data-model/value";
    export const IMAGE_EXTENSIONS: Readonly<Set<string>>;
    /** Determines if the given link points to an embedded image. */
    export function isImageEmbed(link: Link): boolean;
    /** Extract text of the form 'WxH' or 'W' from the display of a link. */
    export function extractImageDimensions(link: Link): [number, number] | [number] | undefined;
}
declare module "ui/markdown" {
    /** Provides core preact / rendering utilities for all view types. */
    import { App, MarkdownRenderChild } from "obsidian";
    import { h, ComponentChildren } from "preact";
    import { Component } from "obsidian";
    import { DataviewSettings } from "settings";
    import { FullIndex } from "data-index/index";
    import { Literal } from "data-model/value";
    export type MarkdownProps = {
        contents: string;
        sourcePath: string;
    };
    export type MarkdownContext = {
        component: Component;
    };
    /** Context need to create dataviews. */
    export type DataviewInit = {
        app: App;
        index: FullIndex;
        settings: DataviewSettings;
        container: HTMLElement;
    };
    /** Shared context for dataview views and objects. */
    export type DataviewContexts = DataviewInit & {
        component: Component;
    };
    export const DataviewContext: import("preact").Context<DataviewContexts>;
    /** Hacky preact component which wraps Obsidian's markdown renderer into a neat component. */
    export function RawMarkdown({ content, sourcePath, inline, style, cls, onClick, }: {
        content: string;
        sourcePath: string;
        inline?: boolean;
        style?: string;
        cls?: string;
        onClick?: (e: preact.JSX.TargetedMouseEvent<HTMLElement>) => void;
    }): h.JSX.Element;
    /** Hacky preact component which wraps Obsidian's markdown renderer into a neat component. */
    export const Markdown: typeof RawMarkdown;
    /** Embeds an HTML element in the react DOM. */
    export function RawEmbedHtml({ element }: {
        element: HTMLElement;
    }): h.JSX.Element;
    /** Embeds an HTML element in the react DOM. */
    export const EmbedHtml: typeof RawEmbedHtml;
    /** Intelligently render an arbitrary literal value. */
    export function RawLit({ value, sourcePath, inline, depth, }: {
        value: Literal | undefined;
        sourcePath: string;
        inline?: boolean;
        depth?: number;
    }): h.JSX.Element;
    /** Intelligently render an arbitrary literal value. */
    export const Lit: typeof RawLit;
    /** Render a simple nice looking error box in a code style. */
    export function ErrorPre(props: {
        children: ComponentChildren;
    }, {}: {}): h.JSX.Element;
    /** Render a pretty centered error message in a box. */
    export function ErrorMessage({ message }: {
        message: string;
    }): h.JSX.Element;
    /**
     * Complex convienence hook which calls `compute` every time the index updates, updating the current state.
     */
    export function useIndexBackedState<T>(container: HTMLElement, app: App, settings: DataviewSettings, index: FullIndex, initial: T, compute: () => Promise<T>): T;
    /** A trivial wrapper which allows a react component to live for the duration of a `MarkdownRenderChild`. */
    export class ReactRenderer extends MarkdownRenderChild {
        init: DataviewInit;
        element: h.JSX.Element;
        constructor(init: DataviewInit, element: h.JSX.Element);
        onload(): void;
        onunload(): void;
    }
}
declare module "ui/views/task-view" {
    import { SListItem, STask } from "data-model/serialized/markdown";
    import { Grouping } from "data-model/value";
    import { MarkdownRenderChild, Vault } from "obsidian";
    import { h } from "preact";
    import { Query } from "query/query";
    import { DataviewInit } from "ui/markdown";
    export type TaskViewState = {
        state: "loading";
    } | {
        state: "error";
        error: string;
    } | {
        state: "ready";
        items: Grouping<SListItem>;
    };
    /**
     * Pure view over (potentially grouped) tasks and list items which allows for checking/unchecking tasks and manipulating
     * the task view.
     */
    export function TaskView({ query, sourcePath }: {
        query: Query;
        sourcePath: string;
    }): h.JSX.Element;
    export function createTaskView(init: DataviewInit, query: Query, sourcePath: string): MarkdownRenderChild;
    export function createFixedTaskView(init: DataviewInit, items: Grouping<SListItem>, sourcePath: string): MarkdownRenderChild;
    /**
     * Removes tasks from a list if they are already present by being a child of another task. Fixes child pointers.
     * Retains original order of input list.
     */
    export function nestItems(raw: SListItem[]): [SListItem[], Set<string>];
    /**
     * Recursively removes tasks from each subgroup if they are already present by being a child of another task.
     * Fixes child pointers. Retains original order of input list.
     */
    export function nestGroups(raw: Grouping<SListItem>): Grouping<SListItem>;
    /** Set the task completion key on check. */
    export function setTaskCompletion(originalText: string, useEmojiShorthand: boolean, completionKey: string, completionDateFormat: string, complete: boolean): string;
    /** Rewrite a task with the given completion status and new text. */
    export function rewriteTask(vault: Vault, task: STask, desiredStatus: string, desiredText?: string): Promise<void>;
}
declare module "ui/views/list-view" {
    import { MarkdownRenderChild } from "obsidian";
    import { Query } from "query/query";
    import { DataviewInit } from "ui/markdown";
    import { h } from "preact";
    import { Literal } from "data-model/value";
    export function ListGrouping({ items, sourcePath }: {
        items: Literal[];
        sourcePath: string;
    }): h.JSX.Element;
    export type ListViewState = {
        state: "loading";
    } | {
        state: "error";
        error: string;
    } | {
        state: "ready";
        items: Literal[];
    };
    /** Pure view over list elements.  */
    export function ListView({ query, sourcePath }: {
        query: Query;
        sourcePath: string;
    }): h.JSX.Element;
    export function createListView(init: DataviewInit, query: Query, sourcePath: string): MarkdownRenderChild;
    export function createFixedListView(init: DataviewInit, elements: Literal[], sourcePath: string): MarkdownRenderChild;
}
declare module "ui/views/table-view" {
    import { Literal } from "data-model/value";
    import { Query } from "query/query";
    import { DataviewInit } from "ui/markdown";
    import { h } from "preact";
    import { MarkdownRenderChild } from "obsidian";
    /** Simple table over headings and corresponding values. */
    export function TableGrouping({ headings, values, sourcePath, }: {
        headings: string[];
        values: Literal[][];
        sourcePath: string;
    }): h.JSX.Element;
    export type TableViewState = {
        state: "loading";
    } | {
        state: "error";
        error: string;
    } | {
        state: "ready";
        headings: string[];
        values: Literal[][];
    };
    /** Pure view over list elements.  */
    export function TableView({ query, sourcePath }: {
        query: Query;
        sourcePath: string;
    }): h.JSX.Element;
    export function createTableView(init: DataviewInit, query: Query, sourcePath: string): MarkdownRenderChild;
    export function createFixedTableView(init: DataviewInit, headings: string[], values: Literal[][], sourcePath: string): MarkdownRenderChild;
}
declare module "query/parse" {
    import * as P from "parsimmon";
    import { FlattenStep, GroupStep, LimitStep, NamedField, Query, QueryHeader, QueryOperation, QuerySortBy, QueryType, SortByStep, WhereStep } from "query/query";
    import { Source } from "data-index/source";
    import { Result } from "api/result";
    /** Typings for the outputs of all of the parser combinators. */
    interface QueryLanguageTypes {
        queryType: QueryType;
        explicitNamedField: NamedField;
        namedField: NamedField;
        sortField: QuerySortBy;
        headerClause: QueryHeader;
        fromClause: Source;
        whereClause: WhereStep;
        sortByClause: SortByStep;
        limitClause: LimitStep;
        flattenClause: FlattenStep;
        groupByClause: GroupStep;
        clause: QueryOperation;
        query: Query;
    }
    /** Return a new parser which executes the underlying parser and returns it's raw string representation. */
    export function captureRaw<T>(base: P.Parser<T>): P.Parser<[T, string]>;
    /** A parsimmon-powered parser-combinator implementation of the query language. */
    export const QUERY_LANGUAGE: P.TypedLanguage<QueryLanguageTypes>;
    /**
     * Attempt to parse a query from the given query text, returning a string error
     * if the parse failed.
     */
    export function parseQuery(text: string): Result<Query, string>;
}
declare module "ui/refreshable-view" {
    import { FullIndex } from "data-index/index";
    import { App, MarkdownRenderChild } from "obsidian";
    import { DataviewSettings } from "settings";
    /** Generic code for embedded Dataviews. */
    export abstract class DataviewRefreshableRenderer extends MarkdownRenderChild {
        container: HTMLElement;
        index: FullIndex;
        app: App;
        settings: DataviewSettings;
        private lastReload;
        constructor(container: HTMLElement, index: FullIndex, app: App, settings: DataviewSettings);
        abstract render(): Promise<void>;
        onload(): void;
        maybeRefresh: () => void;
    }
}
declare module "ui/views/calendar-view" {
    import { FullIndex } from "data-index/index";
    import { App } from "obsidian";
    import { Query } from "query/query";
    import { DataviewSettings } from "settings";
    import { DataviewRefreshableRenderer } from "ui/refreshable-view";
    export class DataviewCalendarRenderer extends DataviewRefreshableRenderer {
        query: Query;
        container: HTMLElement;
        index: FullIndex;
        origin: string;
        settings: DataviewSettings;
        app: App;
        private calendar;
        constructor(query: Query, container: HTMLElement, index: FullIndex, origin: string, settings: DataviewSettings, app: App);
        render(): Promise<void>;
        onClose(): Promise<void>;
    }
}
declare module "api/inline-api" {
    /** Fancy wrappers for the JavaScript API, used both by external plugins AND by the dataview javascript view. */
    import { App, Component } from "obsidian";
    import { FullIndex } from "data-index/index";
    import type { DataviewApi, DataviewIOApi, QueryApiSettings, QueryResult } from "api/plugin-api";
    import { DataviewSettings, ExportSettings } from "settings";
    import { DataObject, Grouping, Link, Literal, Values, Widgets } from "data-model/value";
    import { BoundFunctionImpl } from "expression/functions";
    import { Context } from "expression/context";
    import { DateTime, Duration } from "luxon";
    import * as Luxon from "luxon";
    import { DataArray } from "api/data-array";
    import { SListItem } from "data-model/serialized/markdown";
    import { Result } from "api/result";
    /** Asynchronous API calls related to file / system IO. */
    export class DataviewInlineIOApi {
        api: DataviewIOApi;
        currentFile: string;
        constructor(api: DataviewIOApi, currentFile: string);
        /** Load the contents of a CSV asynchronously, returning a data array of rows (or undefined if it does not exist). */
        csv(path: string, originFile?: string): Promise<DataArray<DataObject> | undefined>;
        /** Asynchronously load the contents of any link or path in an Obsidian vault. */
        load(path: Link | string, originFile?: string): Promise<string | undefined>;
        /** Normalize a link or path relative to an optional origin file. Returns a textual fully-qualified-path. */
        normalize(path: Link | string, originFile?: string): string;
    }
    export class DataviewInlineApi {
        /**
         * The raw dataview indices, which track file <-> metadata relations. Use these if the intuitive API does not support
         * your use case.
         */
        index: FullIndex;
        /** The component that handles the lifetime of this view. Use it if you are adding custom event handlers/components. */
        component: Component;
        /** The path to the current file this script is running in. */
        currentFilePath: string;
        /**
         * The container which holds the output of this view. You can directly append fields to this, if you wish, though
         * the rendering API is likely to be easier for straight-forward purposes.
         */
        container: HTMLElement;
        /** Directly access the Obsidian app object, such as for reaching out to other plugins. */
        app: App;
        /** The general plugin API which much of this inline API delegates to. */
        api: DataviewApi;
        /** Settings which determine defaults, incl. many rendering options. */
        settings: DataviewSettings;
        /** Evaluation context which expressions can be evaluated in. */
        evaluationContext: Context;
        /** Value utilities which allow for type-checking and comparisons. */
        value: typeof Values;
        /** Widget utility functions for creating built-in widgets. */
        widget: typeof Widgets;
        /** IO utilities which are largely asynchronous. */
        io: DataviewInlineIOApi;
        /** Re-exporting of luxon for people who can't easily require it. Sorry! */
        luxon: typeof Luxon;
        /** Dataview functions which can be called from DataviewJS. */
        func: Record<string, BoundFunctionImpl>;
        constructor(api: DataviewApi, component: Component, container: HTMLElement, currentFilePath: string);
        /** Return an array of paths (as strings) corresponding to pages which match the query. */
        pagePaths(query?: string): DataArray<string>;
        /** Map a page path to the actual data contained within that page. */
        page(path: string | Link): DataObject | undefined;
        /** Return an array of page objects corresponding to pages which match the query. */
        pages(query?: string): DataArray<any>;
        /** Return the information about the current page. */
        current(): Record<string, any> | undefined;
        /** Execute a Dataview query, returning the results in programmatic form. */
        query(source: string, originFile?: string, settings?: QueryApiSettings): Promise<Result<QueryResult, string>>;
        /** Error-throwing version of {@link query}. */
        tryQuery(source: string, originFile?: string, settings?: QueryApiSettings): Promise<QueryResult>;
        /** Execute a Dataview query, returning the results in Markdown. */
        queryMarkdown(source: string, originFile?: string, settings?: QueryApiSettings): Promise<Result<string, string>>;
        /** Error-throwing version of {@link queryMarkdown}. */
        tryQueryMarkdown(source: string, originFile?: string, settings?: QueryApiSettings): Promise<string>;
        /**
         * Evaluate a dataview expression (like '2 + 2' or 'link("hello")'), returning the evaluated result.
         * This takes an optional second argument which provides definitions for variables, such as:
         *
         * ```
         * dv.evaluate("x + 6", { x: 2 }) = 8
         * dv.evaluate('link(target)', { target: "Okay" }) = [[Okay]]
         * ```
         *
         * Note that `this` is implicitly available and refers to the current file.
         *
         * This method returns a Result type instead of throwing an error; you can check the result of the
         * execution via `result.successful` and obtain `result.value` or `result.error` resultingly. If
         * you'd rather this method throw on an error, use `dv.tryEvaluate`.
         */
        evaluate(expression: string, context?: DataObject): Result<Literal, string>;
        /** Error-throwing version of `dv.evaluate`. */
        tryEvaluate(expression: string, context?: DataObject): Literal;
        /** Execute a Dataview query and embed it into the current view. */
        execute(source: string): Promise<void>;
        /** Execute a DataviewJS query and embed it into the current view. */
        executeJs(code: string): Promise<void>;
        /**
         * Convert an input element or array into a Dataview data-array. If the input is already a data array,
         * it is returned unchanged.
         */
        array(raw: any): DataArray<any>;
        /** Return true if theg given value is a javascript array OR a dataview data array. */
        isArray(raw: any): raw is DataArray<any> | Array<any>;
        /** Return true if the given value is a dataview data array; this returns FALSE for plain JS arrays. */
        isDataArray(raw: unknown): raw is DataArray<any>;
        /** Create a dataview file link to the given path. */
        fileLink(path: string, embed?: boolean, display?: string): Link;
        /** Create a dataview section link to the given path. */
        sectionLink(path: string, section: string, embed?: boolean, display?: string): Link;
        /** Create a dataview block link to the given path. */
        blockLink(path: string, blockId: string, embed?: boolean, display?: string): Link;
        /** Attempt to extract a date from a string, link or date. */
        date(pathlike: string | Link | DateTime): DateTime | null;
        /** Attempt to extract a duration from a string or duration. */
        duration(dur: string | Duration): Duration | null;
        /** Parse a raw textual value into a complex Dataview type, if possible. */
        parse(value: string): Literal;
        /** Convert a basic JS type into a Dataview type by parsing dates, links, durations, and so on. */
        literal(value: any): Literal;
        /** Deep clone the given literal, returning a new literal which is independent of the original. */
        clone(value: Literal): Literal;
        /**
         * Compare two arbitrary JavaScript values using Dataview's default comparison rules. Returns a negative value if
         * a < b, 0 if a = b, and a positive value if a > b.
         */
        compare(a: any, b: any): number;
        /** Return true if the two given JavaScript values are equal using Dataview's default comparison rules. */
        equal(a: any, b: any): boolean;
        /** Render an HTML element, containing arbitrary text. */
        el<K extends keyof HTMLElementTagNameMap>(el: K, text: any, { container, ...options }?: DomElementInfo & {
            container?: HTMLElement;
        }): HTMLElementTagNameMap[K];
        /** Render an HTML header; the level can be anything from 1 - 6. */
        header(level: number, text: any, options?: DomElementInfo): HTMLHeadingElement;
        /** Render an HTML paragraph, containing arbitrary text. */
        paragraph(text: any, options?: DomElementInfo): HTMLParagraphElement;
        /** Render an inline span, containing arbitrary text. */
        span(text: any, options?: DomElementInfo): HTMLSpanElement;
        /**
         * Render HTML from the output of a template "view" saved as a file in the vault.
         * Takes a filename and arbitrary input data.
         */
        view(viewName: string, input: any): Promise<void>;
        /** Render a dataview list of the given values. */
        list(values?: any[] | DataArray<any>): Promise<void>;
        /** Render a dataview table with the given headers, and the 2D array of values. */
        table(headers: string[], values?: any[][] | DataArray<any>): Promise<void>;
        /** Render a dataview task view with the given tasks. */
        taskList(tasks: Grouping<SListItem>, groupByFile?: boolean): Promise<void>;
        /** Render a table directly to markdown, returning the markdown. */
        markdownTable(headers: string[], values?: any[][] | DataArray<any>, settings?: Partial<ExportSettings>): string;
        /** Render a list directly to markdown, returning the markdown. */
        markdownList(values?: any[] | DataArray<any> | undefined, settings?: Partial<ExportSettings>): string;
        /** Render at ask list directly to markdown, returning the markdown. */
        markdownTaskList(values: Grouping<SListItem>, settings?: Partial<ExportSettings>): string;
    }
    /**
     * Evaluate a script where 'this' for the script is set to the given context. Allows you to define global variables.
     */
    export function evalInContext(script: string, context: any): any;
    /**
     * Evaluate a script possibly asynchronously, if the script contains `async/await` blocks.
     */
    export function asyncEvalInContext(script: string, context: any): Promise<any>;
}
declare module "ui/views/js-view" {
    import { DataviewRefreshableRenderer } from "ui/refreshable-view";
    import { DataviewApi } from "api/plugin-api";
    export class DataviewJSRenderer extends DataviewRefreshableRenderer {
        api: DataviewApi;
        script: string;
        container: HTMLElement;
        origin: string;
        static PREAMBLE: string;
        constructor(api: DataviewApi, script: string, container: HTMLElement, origin: string);
        render(): Promise<void>;
    }
    /** Inline JS renderer accessible using '=$' by default. */
    export class DataviewInlineJSRenderer extends DataviewRefreshableRenderer {
        api: DataviewApi;
        script: string;
        container: HTMLElement;
        target: HTMLElement;
        origin: string;
        static PREAMBLE: string;
        errorbox?: HTMLElement;
        constructor(api: DataviewApi, script: string, container: HTMLElement, target: HTMLElement, origin: string);
        render(): Promise<void>;
    }
}
declare module "ui/export/markdown" {
    import { SListItem } from "data-model/serialized/markdown";
    import { Grouping, Literal } from "data-model/value";
    import { ExportSettings, QuerySettings } from "settings";
    /** Render a table of literals to Markdown. */
    export function markdownTable(headers: string[], values: Literal[][], settings?: QuerySettings & ExportSettings): string;
    /** Render a list of literal elements to a markdown list. */
    export function markdownList(values: Literal[], settings?: QuerySettings & ExportSettings): string;
    /** Render the result of a task query to markdown. */
    export function markdownTaskList(tasks: Grouping<SListItem>, settings?: QuerySettings & ExportSettings, depth?: number): string;
}
declare module "api/plugin-api" {
    /** The general, externally accessible plugin API (available at `app.plugins.plugins.dataview.api` or as global `DataviewAPI`). */
    import { App, Component, MarkdownPostProcessorContext } from "obsidian";
    import { FullIndex } from "data-index/index";
    import { DataObject, Grouping, Link, Literal, Values, Widgets } from "data-model/value";
    import { DataArray } from "api/data-array";
    import { BoundFunctionImpl } from "expression/functions";
    import { Context } from "expression/context";
    import { IdentifierMeaning } from "query/engine";
    import { DateTime, Duration } from "luxon";
    import * as Luxon from "luxon";
    import { CompareOperator } from "compare-versions";
    import { DataviewSettings, ExportSettings } from "settings";
    import { SListItem } from "data-model/serialized/markdown";
    import { Result } from "api/result";
    import { Query } from "query/query";
    /** Asynchronous API calls related to file / system IO. */
    export class DataviewIOApi {
        api: DataviewApi;
        constructor(api: DataviewApi);
        /** Load the contents of a CSV asynchronously, returning a data array of rows (or undefined if it does not exist). */
        csv(path: Link | string, originFile?: string): Promise<DataArray<DataObject> | undefined>;
        /** Asynchronously load the contents of any link or path in an Obsidian vault. */
        load(path: Link | string, originFile?: string): Promise<string | undefined>;
        /** Normalize a link or path relative to an optional origin file. Returns a textual fully-qualified-path. */
        normalize(path: Link | string, originFile?: string): string;
    }
    /** Global API for accessing the Dataview API, executing dataview queries, and  */
    export class DataviewApi {
        app: App;
        index: FullIndex;
        settings: DataviewSettings;
        private verNum;
        /** Evaluation context which expressions can be evaluated in. */
        evaluationContext: Context;
        /** IO API which supports asynchronous loading of data directly. */
        io: DataviewIOApi;
        /** Dataview functions which can be called from DataviewJS. */
        func: Record<string, BoundFunctionImpl>;
        /** Value utility functions for comparisons and type-checking. */
        value: typeof Values;
        /** Widget utility functions for creating built-in widgets. */
        widget: typeof Widgets;
        /** Re-exporting of luxon for people who can't easily require it. Sorry! */
        luxon: typeof Luxon;
        constructor(app: App, index: FullIndex, settings: DataviewSettings, verNum: string);
        /** Utilities to check the current Dataview version and comapre it to SemVer version ranges. */
        version: {
            current: string;
            compare: (op: CompareOperator, ver: string) => boolean;
            satisfies: (range: string) => boolean;
        };
        /** Return an array of paths (as strings) corresponding to pages which match the query. */
        pagePaths(query?: string, originFile?: string): DataArray<string>;
        /** Map a page path to the actual data contained within that page. */
        page(path: string | Link, originFile?: string): Record<string, Literal> | undefined;
        /** Return an array of page objects corresponding to pages which match the source query. */
        pages(query?: string, originFile?: string): DataArray<Record<string, Literal>>;
        /** Remaps important metadata to add data arrays.  */
        private _addDataArrays;
        /**
         * Convert an input element or array into a Dataview data-array. If the input is already a data array,
         * it is returned unchanged.
         */
        array(raw: unknown): DataArray<any>;
        /** Return true if the given value is a javascript array OR a dataview data array. */
        isArray(raw: unknown): raw is DataArray<any> | Array<any>;
        /** Return true if the given value is a dataview data array; this returns FALSE for plain JS arrays. */
        isDataArray(raw: unknown): raw is DataArray<any>;
        /** Create a dataview file link to the given path. */
        fileLink(path: string, embed?: boolean, display?: string): Link;
        /** Create a dataview section link to the given path. */
        sectionLink(path: string, section: string, embed?: boolean, display?: string): Link;
        /** Create a dataview block link to the given path. */
        blockLink(path: string, blockId: string, embed?: boolean, display?: string): Link;
        /** Attempt to extract a date from a string, link or date. */
        date(pathlike: string | Link | DateTime): DateTime | null;
        /** Attempt to extract a duration from a string or duration. */
        duration(str: string | Duration): Duration | null;
        /** Parse a raw textual value into a complex Dataview type, if possible. */
        parse(value: string): Literal;
        /** Convert a basic JS type into a Dataview type by parsing dates, links, durations, and so on. */
        literal(value: any): Literal;
        /** Deep clone the given literal, returning a new literal which is independent of the original. */
        clone(value: Literal): Literal;
        /**
         * Compare two arbitrary JavaScript values using Dataview's default comparison rules. Returns a negative value if
         * a < b, 0 if a = b, and a positive value if a > b.
         */
        compare(a: any, b: any): number;
        /** Return true if the two given JavaScript values are equal using Dataview's default comparison rules. */
        equal(a: any, b: any): boolean;
        /**
         * Execute an arbitrary Dataview query, returning a query result which:
         *
         * 1. Indicates the type of query,
         * 2. Includes the raw AST of the parsed query.
         * 3. Includes the output in the form relevant to that query type.
         *
         * List queries will return a list of objects ({ id, value }); table queries return a header array
         * and a 2D array of values; and task arrays return a Grouping<Task> type which allows for recursive
         * task nesting.
         */
        query(source: string | Query, originFile?: string, settings?: QueryApiSettings): Promise<Result<QueryResult, string>>;
        /** Error-throwing version of {@link query}. */
        tryQuery(source: string, originFile?: string, settings?: QueryApiSettings): Promise<QueryResult>;
        /** Execute an arbitrary dataview query, returning the results in well-formatted markdown. */
        queryMarkdown(source: string | Query, originFile?: string, settings?: Partial<QueryApiSettings & ExportSettings>): Promise<Result<string, string>>;
        /** Error-throwing version of {@link queryMarkdown}. */
        tryQueryMarkdown(source: string | Query, originFile?: string, settings?: Partial<QueryApiSettings & ExportSettings>): Promise<string>;
        /**
         * Evaluate a dataview expression (like '2 + 2' or 'link("hello")'), returning the evaluated result.
         * This takes an optional second argument which provides definitions for variables, such as:
         *
         * ```
         * dv.evaluate("x + 6", { x: 2 }) = 8
         * dv.evaluate('link(target)', { target: "Okay" }) = [[Okay]]
         * ```
         *
         * This method returns a Result type instead of throwing an error; you can check the result of the
         * execution via `result.successful` and obtain `result.value` or `result.error` resultingly. If
         * you'd rather this method throw on an error, use `dv.tryEvaluate`.
         */
        evaluate(expression: string, context?: DataObject): Result<Literal, string>;
        /** Error-throwing version of `dv.evaluate`. */
        tryEvaluate(expression: string, context?: DataObject): Literal;
        /**
         * Execute the given query, rendering results into the given container using the components lifecycle.
         * Your component should be a *real* component which calls onload() on it's child components at some point,
         * or a MarkdownPostProcessorContext!
         *
         * Note that views made in this way are live updating and will automatically clean themselves up when
         * the component is unloaded or the container is removed.
         */
        execute(source: string, container: HTMLElement, component: Component | MarkdownPostProcessorContext, filePath: string): Promise<void>;
        /**
         * Execute the given DataviewJS query, rendering results into the given container using the components lifecycle.
         * See {@link execute} for general rendering semantics.
         */
        executeJs(code: string, container: HTMLElement, component: Component | MarkdownPostProcessorContext, filePath: string): Promise<void>;
        /** Render a dataview list of the given values. */
        list(values: any[] | DataArray<any> | undefined, container: HTMLElement, component: Component, filePath: string): Promise<void>;
        /** Render a dataview table with the given headers, and the 2D array of values. */
        table(headers: string[], values: any[][] | DataArray<any> | undefined, container: HTMLElement, component: Component, filePath: string): Promise<void>;
        /** Render a dataview task view with the given tasks. */
        taskList(tasks: Grouping<SListItem>, groupByFile: boolean | undefined, container: HTMLElement, component: Component, filePath?: string): Promise<void>;
        /** Render an arbitrary value into a container. */
        renderValue(value: any, container: HTMLElement, component: Component, filePath: string, inline?: boolean): Promise<void>;
        /** Render data to a markdown table. */
        markdownTable(headers: string[] | undefined, values: any[][] | DataArray<any> | undefined, settings?: Partial<ExportSettings>): string;
        /** Render data to a markdown list. */
        markdownList(values: any[] | DataArray<any> | undefined, settings?: Partial<ExportSettings>): string;
        /** Render tasks or list items to a markdown task list. */
        markdownTaskList(values: Grouping<SListItem>, settings?: Partial<ExportSettings>): string;
    }
    /** The result of executing a table query. */
    export type TableResult = {
        type: "table";
        headers: string[];
        values: Literal[][];
        idMeaning: IdentifierMeaning;
    };
    /** The result of executing a list query. */
    export type ListResult = {
        type: "list";
        values: Literal[];
        primaryMeaning: IdentifierMeaning;
    };
    /** The result of executing a task query. */
    export type TaskResult = {
        type: "task";
        values: Grouping<SListItem>;
    };
    /** The result of executing a calendar query. */
    export type CalendarResult = {
        type: "calendar";
        values: {
            date: DateTime;
            link: Link;
            value?: Literal[];
        }[];
    };
    /** The result of executing a query of some sort. */
    export type QueryResult = TableResult | ListResult | TaskResult | CalendarResult;
    /** Settings when querying the dataview API. */
    export type QueryApiSettings = {
        /** If present, then this forces queries to include/exclude the implicit id field (such as with `WITHOUT ID`). */
        forceId?: boolean;
    };
    /** Determines if source-path has a `?no-dataview` annotation that disables dataview. */
    export function isDataviewDisabled(sourcePath: string): boolean;
}
declare module "index" {
    export type { DataviewApi } from "api/plugin-api";
    export type { DateTime, Duration } from "luxon";
    export type { Link, DataObject, LiteralType, Literal, LiteralRepr, WrappedLiteral, LiteralWrapper, Widget, } from "data-model/value";
    export type { Result, Success, Failure } from "api/result";
    export type { DataArray } from "api/data-array";
    export type { ListItem, PageMetadata } from "data-model/markdown";
    export type { FullIndex, PrefixIndex, IndexMap } from "data-index/index";
    export type { SMarkdownPage, SListEntry, STask } from "data-model/serialized/markdown";
    import type { DataviewApi } from "api/plugin-api";
    import "obsidian";
    import type { App } from "obsidian";
    /**
     * Get the current Dataview API from the app if provided; if not, it is inferred from the global API object installed
     * on the window.
     */
    export const getAPI: (app?: App) => DataviewApi | undefined;
    /** Determine if Dataview is enabled in the given application. */
    export const isPluginEnabled: (app: App) => boolean;
}
declare module "ui/views/inline-view" {
    import { FullIndex } from "data-index/index";
    import { Field } from "expression/field";
    import { App } from "obsidian";
    import { DataviewSettings } from "settings";
    import { DataviewRefreshableRenderer } from "ui/refreshable-view";
    /** Refreshable renderer which renders inline instead of in a div. */
    export class DataviewInlineRenderer extends DataviewRefreshableRenderer {
        field: Field;
        fieldText: string;
        container: HTMLElement;
        target: HTMLElement;
        index: FullIndex;
        origin: string;
        settings: DataviewSettings;
        app: App;
        errorbox?: HTMLElement;
        constructor(field: Field, fieldText: string, container: HTMLElement, target: HTMLElement, index: FullIndex, origin: string, settings: DataviewSettings, app: App);
        render(): Promise<void>;
    }
}
declare module "ui/views/inline-field" {
    import { MarkdownPostProcessorContext } from "obsidian";
    import { DataviewInit } from "ui/markdown";
    /** Replaces raw textual inline fields in text containers with pretty HTML equivalents. */
    export function replaceInlineFields(ctx: MarkdownPostProcessorContext, init: DataviewInit): Promise<void>;
}
declare module "ui/lp-render" {
    import { DecorationSet, ViewPlugin, ViewUpdate } from "@codemirror/view";
    import { DataviewSettings } from "settings";
    import { FullIndex } from "data-index/index";
    import { DataviewApi } from "api/plugin-api";
    export function inlinePlugin(index: FullIndex, settings: DataviewSettings, api: DataviewApi): ViewPlugin<{
        decorations: DecorationSet;
        update(update: ViewUpdate): void;
    }>;
}
declare module "main" {
    import { Component, MarkdownPostProcessorContext, Plugin } from "obsidian";
    import { FullIndex } from "data-index/index";
    import { DataviewApi } from "api/plugin-api";
    import { DataviewSettings } from "settings";
    import { DataviewInlineApi } from "api/inline-api";
    export default class DataviewPlugin extends Plugin {
        /** Plugin-wide default settigns. */
        settings: DataviewSettings;
        /** The index that stores all dataview data. */
        index: FullIndex;
        /** External-facing plugin API. */
        api: DataviewApi;
        /** CodeMirror 6 extensions that dataview installs. Tracked via array to allow for dynamic update. */
        private cmExtension;
        onload(): Promise<void>;
        private debouncedRefresh;
        private updateRefreshSettings;
        onunload(): void;
        /** Register a markdown post processor with the given priority. */
        registerPriorityMarkdownPostProcessor(priority: number, processor: (el: HTMLElement, ctx: MarkdownPostProcessorContext) => Promise<void>): void;
        /** Register a markdown codeblock post processor with the given priority. */
        registerPriorityCodeblockPostProcessor(language: string, priority: number, processor: (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => Promise<void>): void;
        /**
         * Based on the source, generate a dataview view. This works by doing an initial parsing pass, and then adding
         * a long-lived view object to the given component for life-cycle management.
         */
        dataview(source: string, el: HTMLElement, component: Component | MarkdownPostProcessorContext, sourcePath: string): Promise<void>;
        /** Generate a DataviewJS view running the given source in the given element. */
        dataviewjs(source: string, el: HTMLElement, component: Component | MarkdownPostProcessorContext, sourcePath: string): Promise<void>;
        /** Render all dataview inline expressions in the given element. */
        dataviewInline(el: HTMLElement, component: Component | MarkdownPostProcessorContext, sourcePath: string): Promise<void>;
        /** Update plugin settings. */
        updateSettings(settings: Partial<DataviewSettings>): Promise<void>;
        /** @deprecated Call the given callback when the dataview API has initialized. */
        withApi(callback: (api: DataviewApi) => void): void;
        /**
         * Create an API element localized to the given path, with lifecycle management managed by the given component.
         * The API will output results to the given HTML element.
         */
        localApi(path: string, component: Component, el: HTMLElement): DataviewInlineApi;
    }
}
declare module "api/extensions" {
    import { STask } from "data-model/serialized/markdown";
    /** A general function for deciding how to check a task given it's current state. */
    export type TaskStatusSelector = (task: STask) => Promise<string>;
    /**
     * A dataview extension; allows for registering new functions, altering views, and altering some more
     * advanced dataview behavior.
     **/
    export class Extension {
        plugin: string;
        /** All registered task status selectors for this extension. */
        taskStatusSelectors: Record<string, TaskStatusSelector>;
        constructor(plugin: string);
        /** Register a task status selector under the given name. */
        taskStatusSelector(name: string, selector: TaskStatusSelector): Extension;
    }
}
declare module "data-import/web-worker/import-impl" {
    import { PageMetadata } from "data-model/markdown";
    import { CachedMetadata, FileStats } from "obsidian";
    export function runImport(path: string, contents: string, stats: FileStats, metadata: CachedMetadata): Partial<PageMetadata>;
}
declare module "data-import/web-worker/import-entry" { }
declare module "test/common" {
    import { Literal } from "data-model/value";
    import { Context, LinkHandler } from "expression/context";
    /** Expect that the given dataview expression resolves to the given value. */
    export function expectEvals(text: string, result: Literal): void;
    /** Parse a field expression and evaluate it in the simple context. */
    export function parseEval(text: string): Literal;
    /** Create a trivial link handler which never resolves links. */
    export function simpleLinkHandler(): LinkHandler;
    /** Create a trivial context good for evaluations that do not depend on links. */
    export function simpleContext(): Context;
}
declare module "test/api/data-array.test" { }
declare module "test/data/index-map.test" { }
declare module "test/data/transferable.test" { }
declare module "test/data/values.test" { }
declare module "test/function/aggregation.test" { }
declare module "test/function/coerce.test" { }
declare module "test/function/constructors.test" { }
declare module "test/function/eval.test" { }
declare module "test/function/functions.test" { }
declare module "test/function/meta.test" { }
declare module "test/function/string.test" {
    export const check: (text: string) => jest.JestMatchers<import("index").Literal>;
}
declare module "test/function/vectorization.test" { }
declare module "test/markdown/parse.file.test" { }
declare module "test/parse/parse.expression.test" { }
declare module "test/parse/parse.inline.test" { }
declare module "test/parse/parse.query.test" { }
declare module "test/util/normalize.test" { }
declare module "test/util/paths.test" { }