declare namespace JSX {
    interface IntrinsicElements {
        'rustalyzer-widget': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
            'server-id': string,
            'config'?: string
        }, HTMLElement>
    }
} 