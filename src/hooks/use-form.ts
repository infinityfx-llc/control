import { useRef, useState } from "react";

type Touched<T> = { [key in keyof T]?: boolean; };

type Errors<T> = { [key in keyof T]?: string | boolean; };

type Shell<T> = { [K in keyof T]: T[K] extends { [key: string]: any; } ? Shell<T[K]> : any; };

export type Form<T, V extends Shell<T> = T> = {
    submitting: boolean;
    values: T;
    errors: Errors<T>;
    touched: Touched<T>;
    setValues: (values: Partial<T>) => void;
    setErrors: (errors: Errors<T>) => void;
    fieldProps: <K extends keyof T>(field: K) => {
        value: T[K];
        checked: boolean | undefined;
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
        onBlur: () => void;
        error: Errors<T>[K] | undefined;
    };
    submit: (callback?: (values: V) => Promise<void> | void) => void;
    validate: () => void;
    reset: () => void;
}

export default function useForm<T extends { [key: string]: any; }, V extends Shell<T> = T>({ initial, onValidate, onSubmit, validateOnChange = true }: {
    initial: T;
    onValidate?: (values: T) => Errors<T> | void | undefined;
    onSubmit?: (values: V) => Promise<void> | void;
    validateOnChange?: boolean;
}): Form<T, V> {
    const [submitting, setSubmitting] = useState(false);
    const valuesRef = useRef<T>(initial);
    const [values, setStateValues] = useState<T>(initial);
    const [errors, setErrors] = useState<Errors<T>>({});
    const [touched, setTouched] = useState<Touched<T>>({});

    function validate() {
        if (!onValidate) return valuesRef.current as any as V;

        const errors = onValidate(valuesRef.current);
        if (errors && Object.keys(errors).length) return setErrors(errors);

        return valuesRef.current as any as V;
    }

    function reset() {
        valuesRef.current = Object.assign({}, initial);
        setStateValues(valuesRef.current);
        validate();
    }

    function setValues(values: Partial<T>) {
        Object.assign(valuesRef.current, values);
        setStateValues(Object.assign({}, valuesRef.current));

        if (validateOnChange) validate();
    }

    function fieldProps<K extends keyof T>(field: K) {
        const value = values[field];

        return {
            value,
            checked: typeof value === 'boolean' ? value : undefined,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                setValues({
                    [field]: (e.target.type === 'radio' || e.target.type === 'checkbox') && 'checked' in e.target ?
                        e.target.checked :
                        e.target.value
                } as Partial<T>);
            },
            onBlur: () => {
                setTouched({ ...touched, [field]: true });
                validate();
            },
            error: touched[field] ? errors[field] : undefined
        };
    }

    async function submit(callback?: (values: V) => Promise<void> | void) {
        if (submitting) return;
        setSubmitting(true);

        const touched: Touched<T> = {};
        for (const key in values) touched[key] = true;
        setTouched(touched);

        const cb = onSubmit || callback,
            validated = validate();

        if (validated && cb) await cb(validated);

        setSubmitting(false);
    }

    return {
        submitting,
        values,
        errors,
        touched,
        setValues,
        setErrors,
        fieldProps,
        submit,
        validate,
        reset
    };
}