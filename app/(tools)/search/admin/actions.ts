"use server";

import { revalidatePath } from "next/cache";

import {
	createSearchCategory,
	createSearchSection,
	createSearchTerm,
	deleteSearchCategory,
	deleteSearchSection,
	deleteSearchTerm,
	updateSearchCategory,
	updateSearchSection,
	updateSearchTerm,
} from "@/db/queries/searches";

function revalidateSearch() {
	revalidatePath("/search");
	revalidatePath("/search/admin");
}

export async function createSearchSectionAction(formData: FormData) {
	const name = String(formData.get("name") ?? "").trim();
	const sortOrder = Number(formData.get("sortOrder"));

	if (!name || !Number.isInteger(sortOrder) || sortOrder < 0) {
		return;
	}

	await createSearchSection(name, sortOrder);

	revalidateSearch();
}

export async function updateSearchSectionAction(formData: FormData) {
	const id = Number(formData.get("id"));
	const name = String(formData.get("name") ?? "").trim();
	const sortOrder = Number(formData.get("sortOrder"));

	if (
		!Number.isInteger(id) ||
		id <= 0 ||
		!name ||
		!Number.isInteger(sortOrder) ||
		sortOrder < 0
	) {
		return;
	}

	await updateSearchSection(id, name, sortOrder);

	revalidateSearch();
}

export async function deleteSearchSectionAction(formData: FormData) {
	const id = Number(formData.get("id"));

	if (!Number.isInteger(id) || id <= 0) {
		return;
	}

	await deleteSearchSection(id);

	revalidateSearch();
}

export async function createSearchCategoryAction(formData: FormData) {
	const name = String(formData.get("name") ?? "").trim();
	const sectionId = Number(formData.get("sectionId"));
	const sortOrder = Number(formData.get("sortOrder"));

	if (
		!name ||
		!Number.isInteger(sectionId) ||
		sectionId <= 0 ||
		!Number.isInteger(sortOrder) ||
		sortOrder < 0
	) {
		return;
	}

	await createSearchCategory(name, sectionId, sortOrder);

	revalidateSearch();
}

export async function updateSearchCategoryAction(formData: FormData) {
	const id = Number(formData.get("id"));
	const name = String(formData.get("name") ?? "").trim();
	const sectionId = Number(formData.get("sectionId"));
	const sortOrder = Number(formData.get("sortOrder"));

	if (
		!Number.isInteger(id) ||
		id <= 0 ||
		!name ||
		!Number.isInteger(sectionId) ||
		sectionId <= 0 ||
		!Number.isInteger(sortOrder) ||
		sortOrder < 0
	) {
		return;
	}

	await updateSearchCategory(id, name, sectionId, sortOrder);

	revalidateSearch();
}

export async function deleteSearchCategoryAction(formData: FormData) {
	const id = Number(formData.get("id"));

	if (!Number.isInteger(id) || id <= 0) {
		return;
	}

	await deleteSearchCategory(id);

	revalidateSearch();
}

export async function createSearchTermAction(formData: FormData) {
	const value = String(formData.get("value") ?? "").trim();
	const categoryId = Number(formData.get("categoryId"));
	const sortOrder = Number(formData.get("sortOrder"));

	if (
		!value ||
		!Number.isInteger(categoryId) ||
		categoryId <= 0 ||
		!Number.isInteger(sortOrder) ||
		sortOrder < 0
	) {
		return;
	}

	await createSearchTerm(value, categoryId, sortOrder);

	revalidateSearch();
}

export async function updateSearchTermAction(formData: FormData) {
	const id = Number(formData.get("id"));
	const value = String(formData.get("value") ?? "").trim();
	const categoryId = Number(formData.get("categoryId"));
	const sortOrder = Number(formData.get("sortOrder"));

	if (
		!Number.isInteger(id) ||
		id <= 0 ||
		!value ||
		!Number.isInteger(categoryId) ||
		categoryId <= 0 ||
		!Number.isInteger(sortOrder) ||
		sortOrder < 0
	) {
		return;
	}

	await updateSearchTerm(id, value, categoryId, sortOrder);

	revalidateSearch();
}

export async function deleteSearchTermAction(formData: FormData) {
	const id = Number(formData.get("id"));

	if (!Number.isInteger(id) || id <= 0) {
		return;
	}

	await deleteSearchTerm(id);

	revalidateSearch();
}
