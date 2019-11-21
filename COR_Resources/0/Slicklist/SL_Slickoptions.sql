/*
	--SL_Slickoptions.sql
	declare @BE_ID int; set @BE_ID = 12435;
	declare @SL uniqueidentifier; set @SL = '2112D5DD-EB63-446F-AF64-4C1AEB0A9275';
*/

select top 1
	[SL_SQL] as [sql],
	[SL_SQL_onChanges] as [sqlchanges],

	isnull([SL_asyncEditorLoading], cast(1 as [bit])) as [asyncEditorLoading],
	isnull([SL_autoEdit], cast(0 as [bit])) as [autoEdit],
	isnull([SL_autoHeight], cast(0 as [bit])) as [autoHeight],
	isnull([SL_defaultColumnWidth], 80) as [defaultColumnWidth],
	[SL_defaultSortString] as [defaultSortString],
	isnull([SL_editable], cast(0 as [bit])) as [editable],
	isnull([SL_enableAddRow], cast(0 as [bit])) as [enableAddRow],
	isnull([SL_enableCellNavigation], cast(0 as [bit])) as [enableCellNavigation],
	isnull([SL_enableColumnReorder], cast(0 as [bit])) as [enableColumnReorder],

	--REM: Braucht es für die Kopfzeile für das subscribe auf "onHeaderRowCellRendered"
	isnull([SL_showHeaderRow], cast(0 as [bit])) as [explicitInitialization],

	isnull([SL_forceFitColumns], cast(0 as [bit])) as [forceFitColumns],
	[SL_groupingKey] as [groupingKey],
	isnull([SL_hasCheckbox], cast(0 as [bit])) as [hasCheckbox],
	isnull([SL_headerRowHeight], 25) as [headerRowHeight],
	isnull([SL_leaveSpaceForNewRows], cast(0 as [bit])) as [leaveSpaceForNewRows],
	isnull([SL_multiSelect], cast(0 as [bit])) as [multiSelect],
	isnull([SL_rowHeight], 25) as [rowHeight],
	isnull([SL_showHeaderRow], cast(0 as [bit])) as [showHeaderRow],
	isnull([SL_showTopPanel], cast(0 as [bit])) as [showTopPanel],
	
	case [BE_Language]
		when 'EN' then [SL_LANG_EN]
		when 'FR' then [SL_LANG_FR]
		when 'IT' then [SL_LANG_IT]
		else [SL_LANG_DE]
	end as [title],

	case [BE_Language]
		when 'EN' then [LANG_EN]
		when 'FR' then [LANG_FR]
		when 'IT' then [LANG_IT]
		else [LANG_DE]
	end as [checkboxtooltip],

	--REM: Beta
	case [BE_Language]
		when 'EN' then 'Records @Top. from @Bottom. to <b>@Length.</b>'
		when 'FR' then 'Datensätze @Top. bis @Bottom. von <b>@Length.</b>'
		when 'IT' then 'Datensätze @Top. bis @Bottom. von <b>@Length.</b>'
		else 'Datensätze @Top. bis @Bottom. von <b>@Length.</b>'
	end as [_Text1]
from
	[T_COR_Slicklist]
	left join [T_SYS_Language_Forms] on [LANG_UID] = '504B174F-D916-40D6-B9D7-15C330435E19'
	left join [T_Benutzer] on [BE_ID] = @BE_ID
where
	(
		[SL_UID] = @SL
	);