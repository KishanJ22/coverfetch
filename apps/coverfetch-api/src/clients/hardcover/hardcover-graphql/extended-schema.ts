export interface CachedContributor {
	author: {
		id: number;
		slug: string;
		name: string;
		image: {
			id: number;
			url: string;
			height: number;
			width: number;
			color: string;
			color_name: string;
		};
		contribution: string;
		contributor_role_id: number;
		contributor_specialization_id: number | null;
		contributor_role_name: string;
		contributor_specialization_name: string | null;
		contributor_role_blurb: string | null;
		contributor_specialization_blurb: string | null;
		primary: boolean;
	};
}
