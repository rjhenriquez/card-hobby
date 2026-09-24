import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { searchCategories, searchSections, searchTerms } from "@/db/schema";

export async function getSearchSections() {
	return db
		.select({
			id: searchSections.id,
			name: searchSections.name,
			sortOrder: searchSections.sortOrder,
		})
		.from(searchSections)
		.orderBy(asc(searchSections.sortOrder), asc(searchSections.name));
}

export async function createSearchSection(name: string, sortOrder: number) {
	const [section] = await db
		.insert(searchSections)
		.values({
			name: name.trim(),
			sortOrder,
		})
		.returning();

	return section;
}

export async function updateSearchSection(
	id: number,
	name: string,
	sortOrder: number,
) {
	const [section] = await db
		.update(searchSections)
		.set({
			name: name.trim(),
			sortOrder,
			updatedAt: new Date(),
		})
		.where(eq(searchSections.id, id))
		.returning();

	return section;
}

export async function deleteSearchSection(id: number) {
	const [section] = await db
		.delete(searchSections)
		.where(eq(searchSections.id, id))
		.returning();

	return section;
}

export async function getSearchCategories() {
	return db
		.select({
			id: searchCategories.id,
			name: searchCategories.name,
			sortOrder: searchCategories.sortOrder,
			sectionId: searchCategories.sectionId,
			sectionName: searchSections.name,
		})
		.from(searchCategories)
		.innerJoin(
			searchSections,
			eq(searchCategories.sectionId, searchSections.id),
		)
		.orderBy(
			asc(searchSections.sortOrder),
			asc(searchSections.name),
			asc(searchCategories.sortOrder),
			asc(searchCategories.name),
		);
}

export async function createSearchCategory(
	name: string,
	sectionId: number,
	sortOrder: number,
) {
	const [category] = await db
		.insert(searchCategories)
		.values({
			name: name.trim(),
			sectionId,
			sortOrder,
		})
		.returning();

	return category;
}

export async function updateSearchCategory(
	id: number,
	name: string,
	sectionId: number,
	sortOrder: number,
) {
	const [category] = await db
		.update(searchCategories)
		.set({
			name: name.trim(),
			sectionId,
			sortOrder,
			updatedAt: new Date(),
		})
		.where(eq(searchCategories.id, id))
		.returning();

	return category;
}

export async function deleteSearchCategory(id: number) {
	const [category] = await db
		.delete(searchCategories)
		.where(eq(searchCategories.id, id))
		.returning();

	return category;
}

export async function getSearchTerms() {
	return db
		.select({
			id: searchTerms.id,
			value: searchTerms.value,
			sortOrder: searchTerms.sortOrder,
			categoryId: searchTerms.categoryId,
			categoryName: searchCategories.name,
			sectionId: searchSections.id,
			sectionName: searchSections.name,
		})
		.from(searchTerms)
		.innerJoin(
			searchCategories,
			eq(searchTerms.categoryId, searchCategories.id),
		)
		.innerJoin(
			searchSections,
			eq(searchCategories.sectionId, searchSections.id),
		)
		.orderBy(
			asc(searchSections.sortOrder),
			asc(searchSections.name),
			asc(searchCategories.sortOrder),
			asc(searchCategories.name),
			asc(searchTerms.sortOrder),
			asc(searchTerms.value),
		);
}

export async function createSearchTerm(
	value: string,
	categoryId: number,
	sortOrder: number,
) {
	const [term] = await db
		.insert(searchTerms)
		.values({
			value: value.trim(),
			categoryId,
			sortOrder,
		})
		.returning();

	return term;
}

export async function updateSearchTerm(
	id: number,
	value: string,
	categoryId: number,
	sortOrder: number,
) {
	const [term] = await db
		.update(searchTerms)
		.set({
			value: value.trim(),
			categoryId,
			sortOrder,
			updatedAt: new Date(),
		})
		.where(eq(searchTerms.id, id))
		.returning();

	return term;
}

export async function deleteSearchTerm(id: number) {
	const [term] = await db
		.delete(searchTerms)
		.where(eq(searchTerms.id, id))
		.returning();

	return term;
}

export async function getSearchTermsBySection() {
	const [sections, categories, terms] = await Promise.all([
		getSearchSections(),
		getSearchCategories(),
		getSearchTerms(),
	]);

	return sections.reduce<Record<string, Record<string, string[]>>>(
		(sectionsByName, section) => {
			const sectionCategories = categories.filter(
				(category) => category.sectionId === section.id,
			);

			sectionsByName[section.name] = sectionCategories.reduce<
				Record<string, string[]>
			>((categoriesByName, category) => {
				categoriesByName[category.name] = terms
					.filter((term) => term.categoryId === category.id)
					.map((term) => term.value);

				return categoriesByName;
			}, {});

			return sectionsByName;
		},
		{},
	);
}
