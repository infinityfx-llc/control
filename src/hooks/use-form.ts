import { useRef, useState } from "react";

type Touched<T> = { [key in keyof T]?: boolean; };

type Errors<T> = { [key in keyof T]?: string | boolean; };

export type Form<T> = {
    submitting: boolean;
    values: T;
    errors: Errors<T>;
    touched: Touched<T>;
    setValues: (values: Partial<T>) => void;
    setErrors: (errors: Errors<T>) => void;
    fieldProps: <K extends keyof T>(field: K) => {
        value: T[K];
        checked: boolean | undefined;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        onBlur: () => void;
        error: Errors<T>[K] | undefined;
    };
    submit: (callback?: (values: T) => Promise<void> | void) => void;
    validate: () => void;
    reset: () => void;
}

export default function useForm<T extends { [key: string]: any; }>({ initial, onValidate, onSubmit, validateOnChange = true }: {
    initial: T;
    onValidate?: (values: T) => { [key in keyof T]?: string | boolean; };
    onSubmit?: (values: T) => Promise<void> | void;
    validateOnChange?: boolean;
}): Form<T> {
    const [submitting, setSubmitting] = useState(false);
    const valuesRef = useRef<T>(initial);
    const [values, setStateValues] = useState<T>(initial);
    const [errors, setErrors] = useState<Errors<T>>({});
    const [touched, setTouched] = useState<Touched<T>>({});

    function validate() {
        if (onValidate) setErrors(onValidate(valuesRef.current));
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
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                setValues({
                    [field]: e.target.type === 'radio' || e.target.type === 'checkbox' ?
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

    async function submit(callback?: (values: T) => Promise<void> | void) {
        if (submitting) return;
        setSubmitting(true);

        const touched: Touched<T> = {};
        for (const key in values) touched[key] = true;
        setTouched(touched);

        let validated = {};
        if (onValidate) setErrors(validated = onValidate(valuesRef.current));

        const cb = onSubmit || callback;
        if (!Object.keys(validated).length && cb) await cb(valuesRef.current);

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