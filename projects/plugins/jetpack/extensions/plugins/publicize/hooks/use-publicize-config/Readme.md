# usePublicizeConfig() hook
Simple hook to get config data about the Publicize feature.

```es6
import usePublicizeConfig from '../../hooks/use-publicize-config';

function SavingPostLabel() {
	const { isRePublicizeFeatureEnabled } = usePublicizeConfig();

	if ( ! isRePublicizeFeatureEnabled ) {
		return null;
	}

	return (
		<div>Welcome to the awesome RePublicize feature</div>
	)
}
```

## Disclaimer

The data consumed by this hook doesn't change their state, at least so far. And considering the idea behind using a hook is to deal with when the data change externally to the component, we might consider that using a hook isn't the best option here.

However, we decided to keep using the hook for the reason we consider, and also being optimistic in this sense, that the Jetpack plans data should be handled by a store. In that case, the hook will fit properly.
Finally, we don't see any big problem handing the data via the hook either. 
