# RabbitMQ vhost gets a dedicated topology node type

The RabbitMQ vhost node will be given its own `type` (e.g. `vhost`) in the
backend topology contract, instead of sharing the generic
`operational-grouping` type with the structural "Queues"/"Exchanges" group
folders.

This is driven by the Topology Navigator search (see
[ADR-0004](./0004-topology-search-chip-model.md)): tag keys are derived at
runtime from node `type`s, with `operational-grouping` excluded as structural.
A vhost is a real, addressable entity users want to scope a search by, but while
it carries the generic grouping type it is indistinguishable from the
non-addressable folder nodes. Giving it a distinct type lets it appear as a
`vhost:` tag key for free, without special-casing the vhost path in the search
layer.

The alternative — keeping the shared type and special-casing "an
`operational-grouping` node at the vhost path level" inside the search code —
was rejected because it leaks a topology-shape assumption into the search
feature and would have to be maintained in lockstep with the path structure.
The cost is a backend contract change touching the RabbitMQ topology provider
and any consumer that switches on node `type`.
