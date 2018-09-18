export namespace sameInterfaceInMultipleNamespacesNamespace1 {
    export interface ISameInterfaceInMultipleNamespaces {
    }
}

export namespace sameInterfaceInMultipleNamespacesNamespace2 {
    export type ISameInterfaceInMultipleNamespaces = 
        sameInterfaceInMultipleNamespacesNamespace1.ISameInterfaceInMultipleNamespaces;
}