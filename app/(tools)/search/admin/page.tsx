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

import styles from "@/styles/page/Page.module.scss";

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

				<p className='tempAdmin__intro'>
					Manage the sections, categories, and search terms used to organize
					saved searches.
				</p>
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
								<section key={section.id} className='tempAdmin__section'>
									<header className='tempAdmin__section-header'>
										<div>
											<p className='tempAdmin__type'>Section</p>
											<h3>{section.name}</h3>
											<p>
												{sectionCategories.length}{" "}
												{sectionCategories.length === 1
													? "category"
													: "categories"}
											</p>
										</div>

										<div className='tempAdmin__actions'>
											<form action={updateSearchSectionAction}>
												<input type='hidden' name='id' value={section.id} />

												<label>
													<span>Section Name</span>
													<input
														name='name'
														defaultValue={section.name}
														required
													/>
												</label>

												<label>
													<span>Sort Order</span>
													<input
														type='number'
														name='sortOrder'
														defaultValue={section.sortOrder}
														min={0}
														required
													/>
												</label>

												<button type='submit'>Save Section</button>
											</form>

											<form action={deleteSearchSectionAction}>
												<input type='hidden' name='id' value={section.id} />

												<button type='submit' className='tempAdmin__delete'>
													Delete Section
												</button>
											</form>
										</div>
									</header>

									<div className='tempAdmin__categories'>
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
														className='tempAdmin__category'
													>
														<header className='tempAdmin__category-header'>
															<div>
																<p className='tempAdmin__type'>Category</p>
																<h4>{category.name}</h4>
																<p>
																	{categoryTerms.length}{" "}
																	{categoryTerms.length === 1
																		? "search term"
																		: "search terms"}
																</p>
															</div>

															<div className='tempAdmin__actions'>
																<form action={updateSearchCategoryAction}>
																	<input
																		type='hidden'
																		name='id'
																		value={category.id}
																	/>

																	<label>
																		<span>Category Name</span>
																		<input
																			name='name'
																			defaultValue={category.name}
																			required
																		/>
																	</label>

																	<label>
																		<span>Parent Section</span>
																		<select
																			name='sectionId'
																			defaultValue={category.sectionId}
																			required
																		>
																			{sections.map((sectionOption) => (
																				<option
																					key={sectionOption.id}
																					value={sectionOption.id}
																				>
																					{sectionOption.name}
																				</option>
																			))}
																		</select>
																	</label>

																	<label>
																		<span>Sort Order</span>
																		<input
																			type='number'
																			name='sortOrder'
																			defaultValue={category.sortOrder}
																			min={0}
																			required
																		/>
																	</label>

																	<button type='submit'>Save Category</button>
																</form>

																<form action={deleteSearchCategoryAction}>
																	<input
																		type='hidden'
																		name='id'
																		value={category.id}
																	/>

																	<button
																		type='submit'
																		className='tempAdmin__delete'
																	>
																		Delete Category
																	</button>
																</form>
															</div>
														</header>

														<div className='tempAdmin__terms'>
															<div className='tempAdmin__terms-header'>
																<div>
																	<p className='tempAdmin__type'>
																		Search Terms
																	</p>
																	<p>
																		Individual searches associated with this
																		category.
																	</p>
																</div>
															</div>

															{categoryTerms.length === 0 ? (
																<p className='tempAdmin__empty'>
																	No search terms in this category yet.
																</p>
															) : (
																<ul className='tempAdmin__term-list'>
																	{categoryTerms.map((term) => (
																		<li
																			key={term.id}
																			className='tempAdmin__term'
																		>
																			<form action={updateSearchTermAction}>
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

																				<label>
																					<span>Search Term</span>
																					<input
																						name='value'
																						defaultValue={term.value}
																						required
																					/>
																				</label>

																				<label>
																					<span>Sort Order</span>
																					<input
																						type='number'
																						name='sortOrder'
																						defaultValue={term.sortOrder}
																						min={0}
																						required
																					/>
																				</label>

																				<button type='submit'>Save</button>
																			</form>

																			<form action={deleteSearchTermAction}>
																				<input
																					type='hidden'
																					name='id'
																					value={term.id}
																				/>

																				<button
																					type='submit'
																					className='tempAdmin__delete'
																				>
																					Delete
																				</button>
																			</form>
																		</li>
																	))}
																</ul>
															)}

															<form
																action={createSearchTermAction}
																className='tempAdmin__add-term'
															>
																<input
																	type='hidden'
																	name='categoryId'
																	value={category.id}
																/>

																<label>
																	<span>Add Search Term</span>
																	<input
																		name='value'
																		placeholder='Enter search term'
																		required
																	/>
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

																<button type='submit'>Add Term</button>
															</form>
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
