/*
	--SL_Referencetable.sql
	declare @BE_ID int; set @BE_ID = 12435;
	declare @ID uniqueidentifier; set @ID = '5267AC3C-6725-4724-ADE4-8F2BF4014926'; --REM: [SLCOL_UID]
*/

declare @tTablename varchar(255); set @tTablename = (
	select top 1 [SLCOL_referenceTablename] from [T_COR_Ref_Slickcolumn] where [SLCOL_UID] = @ID
);

if @tTablename = 'T_Benutzer' begin
	select
		[BE_ID] as [Value],
		[Default] as [Text]
	from
		[fu_VAL_Benutzer](@BE_ID, null)
	order by
		[Text]
end
else if @tTablename = 'T_Benutzergruppen' begin
	select
		[ID] as [Value],
		[Name] as [Text]
	from
		[T_Benutzergruppen]
	where
		(
			[isDisplayedInBasic] = 1
		)
	order by
		[Text]
end
else if @tTablename = 'T_AV_Adressen' begin
	select
		[ADR_UID] as [Value],
		[ADR_Default] as [Text]
	from
		[fu_VAL_Adressen](@BE_ID)
	order by
		[Text]
end
else if @tTablename = 'T_SYS_Module' begin
	select
		[MOD_UID] as [Value],
		[MOD_Modul] as [Text]
	from
		[T_SYS_Module]
	where
		(
			[MOD_Status] in (0, 1)
		)
	order by
		[Text]
end
else if @tTablename = 'T_Fake_Boolean' begin
	select
		[Value],
		[Text]
	from
		(
			select
				1 as [Sort],
				0 as [Value],

				ltrim(rtrim(
					case [BE_Language] 
						when 'EN' then [LANG_EN]
						when 'FR' then [LANG_FR]
						when 'IT' then [LANG_IT]
						else [LANG_DE]
					end
				)) as [Text]
			from
				[T_SYS_Language_Forms]
				inner join [T_Benutzer] on [BE_ID] = @BE_ID
			where
				(
					[LANG_UID] = '0E757C91-A547-4664-96AA-590EAA422B9B'
				)
			union all
			
			select
				0 as [Sort],
				1 as [Value],

				ltrim(rtrim(
					case [BE_Language] 
						when 'EN' then [LANG_EN]
						when 'FR' then [LANG_FR]
						when 'IT' then [LANG_IT]
						else [LANG_DE]
					end
				)) as [Text]
			from
				[T_SYS_Language_Forms]
				inner join [T_Benutzer] on [BE_ID] = @BE_ID
			where
				(
					[LANG_UID] = 'EC0455CF-9100-44D5-93DF-8F2D5A838406'
				)
		) as [tData]
	order by
		[Sort],
		[Text]
end
else if @tTablename like 'T_COR_MetaKatalog:%' begin
	select
		[MEK_UID] as [Value],

		case [BE_Language]
			when 'EN' then [MEK_Lang_DE]
			when 'FR' then [MEK_Lang_DE]
			when 'IT' then [MEK_Lang_DE]
			else [MEK_Lang_DE]
		end as [Text] 
	from
		[T_COR_Ref_Slickcolumn]
		inner join [T_COR_MetaFelder] on cast([MEF_UID] as varchar(36)) = replace([SLCOL_field], '_', '-')
		inner join [T_COR_MetaKatalog] on [MEK_MEK_UID] = [MEF_MEK_UID]
		inner join [T_Benutzer] on [BE_ID] = @BE_ID
	where
		(
			([SLCOL_UID] = @ID) and
			([MEK_Status] in (0, 1)) and
			(not [MEK_isNull] = 1)
		)
	order by
		[MEK_Sort],
		[Text]
end
else if @tTablename like 'T_AP_Ref_DokumentMetadaten:%' begin
	select
		[C].[DMET_UID] as [Value],

		case [BE_Language]
			when 'EN' then [C].[DMET_Lang_DE]
			when 'FR' then [C].[DMET_Lang_DE]
			when 'IT' then [C].[DMET_Lang_DE]
			else [C].[DMET_Lang_DE]
		end as [Text] 
	from
		[T_COR_Ref_Slickcolumn]
		inner join [T_AP_Ref_DokumentMetadaten] as [P] on cast([P].[DMET_UID] as varchar(36)) = replace([SLCOL_field], '_', '-')
		inner join [T_AP_Ref_DokumentMetadaten] as [C] on [C].[DMET_DMET_UID] = [P].[DMET_UID]
		inner join [T_Benutzer] on [BE_ID] = @BE_ID
	where
		(
			([SLCOL_UID] = @ID) and
			([P].[DMET_Status] in (0, 1)) and 
			([C].[DMET_Status] in (0, 1)) 
		)
	order by
		[C].[DMET_Sort],
		[Text]
end
else begin
	declare @tPrefix varchar(10);
	set @tPrefix = (select top 1 left([COLUMN_NAME], charindex('_', [COLUMN_NAME]) - 1) from information_schema.columns where [TABLE_NAME] = @tTablename);

	declare @tLanguage varchar(20);
	set @tLanguage = (select top 1 [BE_Language] from [T_Benutzer] where [BE_ID] = @BE_ID);

	declare @tSQL nvarchar(max);
	--set @tSQL = replace(replace(replace('
	set @tSQL = '
		select
			[@Prefix._UID] as [Value]
	';

	--REM: Übersetzung
	if exists(select * from information_schema.columns where [TABLE_NAME] = @tTablename and [COLUMN_NAME] = '_' + @tPrefix + '_Label_' + @tLanguage) begin
		set @tSQL = @tSQL + '
			,[_@Prefix._Label_@Language.] as [Text]
		'
	end
	else begin
		set @tSQL = @tSQL + '
			,[@Prefix._Lang_@Language.] as [Text]
		'
	end;

	--REM: Vorauswahl
	if exists(select * from information_schema.columns where [TABLE_NAME] = @tTablename and [COLUMN_NAME] = @tPrefix + '_isPrefiltered') begin
		set @tSQL = @tSQL + '
			,[@Prefix._isPrefiltered] as [Selected]
		'
	end;
	--else if exists(select * from information_schema.columns where [TABLE_NAME] = @tTablename and [COLUMN_NAME] = @tPrefix + '_isDefault') begin
	--	set @tSQL = @tSQL + '
	--		,[@Prefix._isDefault] as [Selected]
	--	'
	--end;

	--REM: StylizerBack
	if exists(select * from information_schema.columns where [TABLE_NAME] = @tTablename and [COLUMN_NAME] = @tPrefix + '_StylizerBack') begin
		set @tSQL = @tSQL + '
			,case
				when not [@Prefix._StylizerFore] = [@Prefix._StylizerBack] then ''#'' + [tColor].[COL_Hex]
			end as [Color]
		'
	end;

	--REM: StylizerFore
	if exists(select * from information_schema.columns where [TABLE_NAME] = @tTablename and [COLUMN_NAME] = @tPrefix + '_StylizerFore') begin
		set @tSQL = @tSQL + '
			,case
				when not [@Prefix._StylizerFore] = [@Prefix._StylizerBack] then ''#'' + [tBackground].[COL_Hex]
			end as [backgroundColor]
		'
	end;

	set @tSQL = @tSQL + '
		from
			[@tTablename.]
	';

	--REM: StylizerBack
	if exists(select * from information_schema.columns where [TABLE_NAME] = @tTablename and [COLUMN_NAME] = @tPrefix + '_StylizerBack') begin
		set @tSQL = @tSQL + '
			left join [T_SYS_ApertureColorToHex] as [tBackground] on [tBackground].[COL_Aperture] = [@Prefix._StylizerBack]
		'
	end;

	--REM: StylizerFore
	if exists(select * from information_schema.columns where [TABLE_NAME] = @tTablename and [COLUMN_NAME] = @tPrefix + '_StylizerBack') begin
		set @tSQL = @tSQL + '
			left join [T_SYS_ApertureColorToHex] as [tColor] on [tColor].[COL_Aperture] = [@Prefix._StylizerFore]
		'
	end;

	set @tSQL = @tSQL + '
		where
			(
				[@Prefix._Status] in (0, 1)
	';

	--REM: Filtert bei rekursiven Tabellen auf die erste Stufe
	if exists(select * from information_schema.columns where [TABLE_NAME] = @tTablename and [COLUMN_NAME] = @tPrefix + '_' + @tPrefix + '_UID') begin
		set @tSQL = @tSQL + '
			and [@Prefix._@Prefix._UID] is null
		'
	end;

	set @tSQL = @tSQL + '
			)
		order by
			[@Prefix._Sort],
			[Text]
	';

	set @tSQL = replace(replace(replace(
	@tSQL
	, '@tTablename.', @tTablename)
	, '@Prefix.', @tPrefix)
	, '@Language.', @tLanguage);

	execute(@tSQL)
end;