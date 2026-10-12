import {
	getSearchCategories,
	getSearchSections,
	getSearchTerms,
} from "@/db/queries/searches";

import {
	createSearchCategoryAction,
	createSearchSectionAction,
	createSearchTermAction,
	deleteSearchCategoryAction,
	deleteSearchSectionAction,
	deleteSearchTermAction,
	updateSearchCategoryAction,
	updateSearchSectionAction,
	updateSearchTermAction,
} from "./actions";
import { InputText } from "@/components/InputText/InputText";
import { InputSelect } from "@/components/InputSelect/InputSelect";
import { Accordion } from "@/components/Accordion/Accordion";
import { Button } from "@/components/Button/Button";
import styles from "@/styles/page/Page.module.scss";
import adminStyles from "@/styles/components/SearchAdmin.module.scss";

export default async function SearchAdminPage() {
	const [sections, categories, terms] = await Promise.all([
		getSearchSections(),
		getSearchCategories(),
		getSearchTerms(),
	]);

	return (
		<div className={`tempAdmin ${styles.Page}`}>
			<div className={styles.Page__header}>
				<h1 className={styles.Page__heading}>Search Admin</h1>
			</div>

			<div className='tempAdmin__setup'>
				<section className='tempAdmin__panel'>
					<header className='tempAdmin__panel-header'>
						<p className='tempAdmin__eyebrow'>Step 1</p>
						<h2>Sections</h2>
						<p>
							Sections are the top-level groups. Categories are organized inside
							them.
						</p>
					</header>

					<form action={createSearchSectionAction} className='tempAdmin__form'>
						<label>
							<span>Section Name</span>
							<input name='name' placeholder='e.g. Sports Cards' required />
						</label>

						<label>
							<span>Sort Order</span>
							<input
								type='number'
								name='sortOrder'
								defaultValue={0}
								min={0}
								required
							/>
						</label>

						<button type='submit'>Add Section</button>
					</form>
				</section>

				<section className='tempAdmin__panel'>
					<header className='tempAdmin__panel-header'>
						<p className='tempAdmin__eyebrow'>Step 2</p>
						<h2>Categories</h2>
						<p>
							Categories live inside a section and contain the individual search
							terms.
						</p>
					</header>

					{sections.length === 0 ? (
						<p className='tempAdmin__empty'>
							Create a section before adding categories.
						</p>
					) : (
						<form
							action={createSearchCategoryAction}
							className='tempAdmin__form'
						>
							<label>
								<span>Category Name</span>
								<input name='name' placeholder='e.g. Marvel' required />
							</label>

							<label>
								<span>Parent Section</span>

								<select name='sectionId' required defaultValue=''>
									<option value='' disabled>
										Select section
									</option>

									{sections.map((section) => (
										<option key={section.id} value={section.id}>
											{section.name}
										</option>
									))}
								</select>
							</label>

							<label>
								<span>Sort Order</span>
								<input
									type='number'
									name='sortOrder'
									defaultValue={0}
									min={0}
									required
								/>
							</label>

							<button type='submit'>Add Category</button>
						</form>
					)}
				</section>
			</div>

			<section className='tempAdmin__data'>
				<header className='tempAdmin__data-header'>
					<p className='tempAdmin__eyebrow'>Current Structure</p>
					<h2>Search Data</h2>
					<p>
						Everything below shows the current hierarchy. Each section contains
						its categories, and each category contains its search terms.
					</p>
				</header>

				{sections.length === 0 ? (
					<p className='tempAdmin__empty'>No sections yet.</p>
				) : (
					<div className='tempAdmin__sections'>
						{sections.map((section) => {
							const sectionCategories = categories.filter(
								(category) => category.sectionId === section.id,
							);

							return (
								<section
									key={section.id}
									className={adminStyles.SearchAdmin__section}
								>
									<header className={adminStyles.SearchAdmin__section__header}>
										<div className={adminStyles.SearchAdmin__section__heading}>
											<p className={adminStyles.SearchAdmin__section__eyebrow}>
												Section
											</p>

											<h2 className={adminStyles.SearchAdmin__section__title}>
												{section.name}
											</h2>

											<p className={adminStyles.SearchAdmin__section__subhead}>
												{sectionCategories.length}{" "}
												{sectionCategories.length === 1
													? "category"
													: "categories"}
											</p>
										</div>
									</header>
									<div className={adminStyles.SearchAdmin__section__edits}>
										<form
											action={updateSearchSectionAction}
											className={adminStyles.SearchAdmin__section__edits__form}
										>
											<input type='hidden' name='id' value={section.id} />

											<InputText
												name='name'
												label='Section Name'
												defaultValue={section.name}
												required
											/>

											<InputText
												label='Sort Order'
												className={adminStyles.SearchAdmin__input__sort}
												type='number'
												name='sortOrder'
												min={0}
												required
												defaultValue={section.sortOrder}
											/>
											<Button
												type='main'
												variant='primary'
												htmlType='submit'

												label='Save Section'
											/>
										</form>

										<form
											action={deleteSearchSectionAction}
											className={adminStyles.SearchAdmin__section__edits__form}
										>
											<input type='hidden' name='id' value={section.id} />
											<Button
												type='main'
												variant='delete'
												htmlType='submit'

												label='Delete Section'
											/>
										</form>
									</div>
									<div className={adminStyles.SearchAdmin__section__content}>
										{sectionCategories.length === 0 ? (
											<p className='tempAdmin__empty'>
												No categories in this section.
											</p>
										) : (
											sectionCategories.map((category) => {
												const categoryTerms = terms.filter(
													(term) => term.categoryId === category.id,
												);

												return (
													<div
														key={category.id}
														className={adminStyles.SearchAdmin__section}
													>
														<header
															className={`${adminStyles.SearchAdmin__section__header} ${
																adminStyles[
																	"SearchAdmin__section__header--nested"
																]
															}  `}
														>
															<div
																className={
																	adminStyles.SearchAdmin__section__heading
																}
															>
																<p
																	className={
																		adminStyles.SearchAdmin__section__eyebrow
																	}
																>
																	Category
																</p>

																<h2
																	className={
																		adminStyles.SearchAdmin__section__title
																	}
																>
																	{category.name}
																</h2>

																<p
																	className={
																		adminStyles.SearchAdmin__section__subhead
																	}
																>
																	{categoryTerms.length}{" "}
																	{categoryTerms.length === 1
																		? "search term"
																		: "search terms"}
																</p>
															</div>
														</header>

														<div
															className={
																adminStyles.SearchAdmin__section__edits
															}
														>
															<form
																action={updateSearchCategoryAction}
																className={
																	adminStyles.SearchAdmin__section__edits__form
																}
															>
																<input
																	type='hidden'
																	name='id'
																	value={category.id}
																/>

																<InputText
																	name='name'
																	label='Category Name'
																	defaultValue={category.name}
																	required
																/>

																<InputSelect
																	name='sectionId'
																	label='Parent Section'
																	defaultValue={category.sectionId.toString()}
																	options={sections.map((sectionOption) => ({
																		label: sectionOption.name,
																		value: sectionOption.id.toString(),
																	}))}
																/>

																<InputText
																	label='Sort Order'
																	className={
																		adminStyles[
																			"SearchAdmin__input__sort--stacked"
																		]
																	}
																	type='number'
																	name='sortOrder'
																	min={0}
																	required
																	defaultValue={category.sortOrder}
																/>
																<Button
																	type='main'
																	variant='primary'
																	htmlType='submit'
																	label='Save Category'
																/>
															</form>

															<form action={deleteSearchCategoryAction}>
																<input
																	type='hidden'
																	name='id'
																	value={category.id}
																/>

																<Button
																	type='main'
																	variant='delete'
																	htmlType='submit'
																	label='Delete Section'
																/>
															</form>
														</div>

														<div
															className={
																adminStyles.SearchAdmin__section__content
															}
														>
															{categoryTerms.length === 0 ? (
																<p
																	className={
																		adminStyles.SearchAdmin__terms__header
																	}
																>
																	No search terms in this category yet.
																</p>
															) : (
																<>
																	<p>Search Terms</p>
																	<ul
																		className={
																			adminStyles.SearchAdmin__terms__list
																		}
																	>
																		{categoryTerms.map((term) => (
																			<li
																				key={term.id}
																				className={
																					adminStyles.SearchAdmin__terms__term
																				}
																			>
																				<form
																					action={updateSearchTermAction}
																					className={
																						adminStyles.SearchAdmin__terms__form
																					}
																				>
																					<input
																						type='hidden'
																						name='id'
																						value={term.id}
																					/>

																					<input
																						type='hidden'
																						name='categoryId'
																						value={category.id}
																					/>

																					<InputText
																						name='value'
																						layout='row'
																						label='Search Term'
																						defaultValue={term.value}
																						required
																					/>

																					<InputText
																						label='Sort Order'
																						layout='row'
																						className={
																							adminStyles.SearchAdmin__input__sort
																						}
																						type='number'
																						name='sortOrder'
																						min={0}
																						required
																						defaultValue={term.sortOrder}
																					/>

																					<Button
																						type='main'
																						variant='primary'
																						htmlType='submit'
																						label='Save'
																					/>
																				</form>

																				<form action={deleteSearchTermAction}>
																					<input
																						type='hidden'
																						name='id'
																						value={term.id}
																					/>

																					<Button
																						type='main'
																						variant='delete'
																						htmlType='submit'
																						label='Delete'
																					/>
																				</form>
																			</li>
																		))}
																	</ul>
																	<form
																		action={createSearchTermAction}
																		className={`${adminStyles["SearchAdmin__terms__form--add"]} ${adminStyles["SearchAdmin__terms__form"]}`}
																	>
																		<input
																			type='hidden'
																			name='categoryId'
																			value={category.id}
																		/>

																		<InputText
																			name='value'
																			label='Add Search Term'
																			placeholder='Enter search term'
																			required
																		/>

																		<InputText
																			label='Sort Order'
																			className={
																				adminStyles.SearchAdmin__input__sort
																			}
																			type='number'
																			name='sortOrder'
																			min={0}
																			required
																			defaultValue={0}
																		/>
																		<Button
																			type='main'
																			variant='primary'
																			htmlType='submit'
																			label='Add Term'
																		/>
																	</form>
																</>
															)}
														</div>
													</div>
												);
											})
										)}
									</div>
								</section>
							);
						})}
					</div>
				)}
			</section>
		</div>
	);
}
