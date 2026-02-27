import * as Sentry from "@sentry/tanstackstart-react";
import { env } from "@/lib/env";

function safeMetric(fn: () => void) {
	if (!env.VITE_SENTRY_DSN) return;
	try {
		fn();
	} catch {
		// metrics must not affect app behavior
	}
}

export function trackListCreated(
	listType: string,
	outcome: "success" | "failure",
) {
	safeMetric(() =>
		Sentry.metrics.count("app.list.created", 1, {
			attributes: { list_type: listType, outcome },
		}),
	);
}

export function trackListDeleted(outcome: "success" | "failure") {
	safeMetric(() =>
		Sentry.metrics.count("app.list.deleted", 1, {
			attributes: { outcome },
		}),
	);
}

export function trackItemCreated(
	itemType: string,
	outcome: "success" | "failure",
) {
	safeMetric(() =>
		Sentry.metrics.count("app.item.created", 1, {
			attributes: { item_type: itemType, outcome },
		}),
	);
}

export function trackItemDeleted(outcome: "success" | "failure") {
	safeMetric(() =>
		Sentry.metrics.count("app.item.deleted", 1, {
			attributes: { outcome },
		}),
	);
}

export function trackItemUpdated(outcome: "success" | "failure") {
	safeMetric(() =>
		Sentry.metrics.count("app.item.updated", 1, {
			attributes: { outcome },
		}),
	);
}

export function trackItemToggleComplete(outcome: "success" | "failure") {
	safeMetric(() =>
		Sentry.metrics.count("app.item.toggle_complete", 1, {
			attributes: { outcome },
		}),
	);
}

export function trackItemIncrement(outcome: "success" | "failure") {
	safeMetric(() =>
		Sentry.metrics.count("app.item.increment", 1, {
			attributes: { outcome },
		}),
	);
}

export function trackItemStatusUpdated(outcome: "success" | "failure") {
	safeMetric(() =>
		Sentry.metrics.count("app.item.status_updated", 1, {
			attributes: { outcome },
		}),
	);
}

export function trackTagCreated(outcome: "success" | "failure") {
	safeMetric(() =>
		Sentry.metrics.count("app.tag.created", 1, {
			attributes: { outcome },
		}),
	);
}

export function trackTagDeleted(outcome: "success" | "failure") {
	safeMetric(() =>
		Sentry.metrics.count("app.tag.deleted", 1, {
			attributes: { outcome },
		}),
	);
}

export function trackListEditorAdded(outcome: "success" | "failure") {
	safeMetric(() =>
		Sentry.metrics.count("app.list.editor_added", 1, {
			attributes: { outcome },
		}),
	);
}

export function trackListEditorRemoved(outcome: "success" | "failure") {
	safeMetric(() =>
		Sentry.metrics.count("app.list.editor_removed", 1, {
			attributes: { outcome },
		}),
	);
}

export function trackListDuplicated(outcome: "success" | "failure") {
	safeMetric(() =>
		Sentry.metrics.count("app.list.duplicated", 1, {
			attributes: { outcome },
		}),
	);
}

export function trackListArchived(outcome: "success" | "failure") {
	safeMetric(() =>
		Sentry.metrics.count("app.list.archived", 1, {
			attributes: { outcome },
		}),
	);
}

export function trackListRestored(outcome: "success" | "failure") {
	safeMetric(() =>
		Sentry.metrics.count("app.list.restored", 1, {
			attributes: { outcome },
		}),
	);
}

export function trackListExported(outcome: "success" | "failure") {
	safeMetric(() =>
		Sentry.metrics.count("app.list.exported", 1, {
			attributes: { outcome },
		}),
	);
}

export function trackPageView(route: string) {
	safeMetric(() =>
		Sentry.metrics.count("app.page.view", 1, {
			attributes: { route },
		}),
	);
}

export function trackCtaClicked(cta: "get_started" | "support") {
	safeMetric(() =>
		Sentry.metrics.count("app.cta.clicked", 1, {
			attributes: { cta },
		}),
	);
}
