export namespace sameClassInMultipleNamespacesNamespace1 {
    export class SameClassInMultipleNamespaces {
    }
}

export namespace sameClassInMultipleNamespacesNamespace2 {
    export const SameClassInMultipleNamespaces =
        sameClassInMultipleNamespacesNamespace1.SameClassInMultipleNamespaces;
}