/*
	--SL_getMetadata.sql
	declare @BE_ID int; set @BE_ID = 12435;
	declare @SL uniqueidentifier; set @SL = '2112d5dd-eb63-446f-af64-4c1aeb0a9289'
*/

declare @tSQL nvarchar(max);

--REM: Tabelle
if object_id('tempdb..##xxxResult') is not null drop table [##xxxResult];
create table [##xxxResult](
	[id] uniqueidentifier
);

--REM: Slicklist des DMS (=hat eigene Metadaten und keine Kundendaten)
if not @SL in ('E51FF614-BB38-45D5-0000-000000000000', 'E51FF614-BB38-45D5-4000-000000000000') begin
	--REM: Tabelle
	if object_id('tempdb..##xxxMEW') is not null drop table [##xxxMEW];
	create table [##xxxMEW](
		[_MEF_UID] uniqueidentifier,
		[_MEW_OBJ_UID] uniqueidentifier,
		[_MEW_Value] varchar(255),
		[_exec] varchar(max),
		[_exec2] varchar(max)
	);

	--REM: Werte
	insert into [##xxxMEW]
	select
		[MEF_UID] as [_MEF_UID],
		[MEW_OBJ_UID] as [_MEW_OBJ_UID],
		[MEW_Value] as [_MEW_Value],

		'
			alter table [##xxxResult] add [' + [_MEF_UID] + '] varchar(255) null;
			alter table [##xxxResult] add [' + [_MEF_UID] + '_Text] varchar(255) null;
		' as [_exec],

		case
			when not [MEK_UID] is null then
				'update [##xxxResult] set [' + [_MEF_UID] + '_Text] = ''' +
				isnull(case [BE_Language] when 'EN' then [MEK_Lang_EN] when 'FR' then [MEK_Lang_FR] when 'IT' then [MEK_Lang_IT] else [MEK_Lang_DE] end, '') +
				''' where [id] = ''' + cast([MEW_OBJ_UID] as varchar(36)) + ''';'
			else
				''
		end +
		'update [##xxxResult] set [' + [_MEF_UID] + '] = ''' + [MEW_Value] + ''' where [id] = ''' + cast([MEW_OBJ_UID] as varchar(36)) + ''';' as [_exec]
	from
		[T_COR_MetaFelder]
	
		inner join [T_COR_MetaWerte] on [MEW_MEF_UID] = [MEF_UID]
			and ([MEW_dateCreated] <= current_timestamp)
			and ([MEW_dateDeleted] is null or [MEW_dateDeleted] >= current_timestamp)

		left join [T_COR_MetaKatalog] on cast([MEK_UID] as varchar(36)) = [MEW_Value]

		cross apply(
			select replace(cast([MEF_UID] as varchar(36)), '-', '_') as [_MEF_UID]
		) as [tMEF]

		inner join [T_Benutzer] on [BE_ID] = @BE_ID
	where
		(
			([_MEF_UID] in (select [SLCOL_field] from [T_COR_Ref_Slickcolumn] where [SLCOL_SL_UID] = @SL))
		);

	--REM: [id] einfügen
	insert into [##xxxResult]
	select distinct [_MEW_OBJ_UID] as [id] from [##xxxMEW];

	--REM: Spalten erstellen und Werte einfügen
	select @tSQL = isnull(@tSQL, '') + [_exec] from (select distinct [_exec] from [##xxxMEW]) as [tData];
	if not @tSQL is null begin
	print @tSQL;
		execute(@tSQL);
		set @tSQL = ''
	end;

	select @tSQL = isnull(@tSQL, '') + [_exec2] from (select distinct [_exec2] from [##xxxMEW]) as [tData];
	if not @tSQL is null begin
		execute(@tSQL)
	end;

	if object_id('tempdb..##xxxMEW') is not null drop table [##xxxMEW]
end
else begin
	
	--REM: Tabelle
	if object_id('tempdb..##xxxDMET') is not null drop table [##xxxDMET];
	create table [##xxxDMET](
		[_DMET_UID] uniqueidentifier,
		[_MEW_OBJ_UID] uniqueidentifier,
		[_MEW_Value] varchar(255),
		[_exec] varchar(max),
		[_exec2] varchar(max)
	);

	--REM: Werte
	;with [Data] as (
		select 
			[M].[DMET_UID],
			[_DMET_UID],
			[_P_DMET_UID],
			[ZO_DKDMET_DK_UID] as [_MEW_OBJ_UID],

			CASE WHEN [M].[DMET_IsFreeText] = 1 THEN 
				isnull([ZO_DKDMET_FreeText],'') 
			ELSE 
				case [BE_Language]
					when 'EN' then [M].[DMET_Lang_EN]
					when 'FR' then [M].[DMET_Lang_FR]
					when 'IT' then [M].[DMET_Lang_IT]
					else [M].[DMET_Lang_DE]
				end
			END as [_MEW_Value]

		from [T_AP_Ref_DokumentMetadaten] as [M]
		left join [T_ZO_AP_Dokumente_AP_Ref_DokumentMetadaten] on [ZO_DKDMET_DMET_UID] = [M].[DMET_UID] and
			[ZO_DKDMET_Status] = 1
		left join [T_AP_Ref_DokumentMetadaten] as [P] on [M].[DMET_DMET_UID] = [P].[DMET_UID] and
			[P].[DMET_Status] = 1 

			cross apply(
				select 
					replace(cast(coalesce([P].[DMET_UID],[M].[DMET_UID]) as varchar(36)), '-', '_') as [_DMET_UID],
					replace(cast([P].[DMET_UID] as varchar(36)), '-', '_') as [_P_DMET_UID]
			) as [tMEF]

			inner join [T_Benutzer] on [BE_ID] = @BE_ID
		where
			(
				([_DMET_UID] in (select [SLCOL_field] from [T_COR_Ref_Slickcolumn] where [SLCOL_SL_UID] = @SL))
			) and 
			[ZO_DKDMET_DK_UID] is not null 
	)
	insert into [##xxxDMET]
	select
		[DMET_UID],
		[_MEW_OBJ_UID],
		[_MEW_Value],

		'
			alter table [##xxxResult] add [' + [_DMET_UID] + '] varchar(255) null;
			alter table [##xxxResult] add [' + [_DMET_UID] + '_Text] varchar(255) null;
		' as [_exec],

		case
			when not [_P_DMET_UID] is null then
				'update [##xxxResult] set [' + [_DMET_UID] + '_Text] = ''' + isnull([_MEW_Value], '') +	''' where [id] = ''' + cast([_MEW_OBJ_UID] as varchar(36)) + ''';'
			else
				''
		end +
		'update [##xxxResult] set [' + [_DMET_UID] + '] = ''' + case when not [_P_DMET_UID] is null then convert(varchar(36),[DMET_UID]) else isnull([_MEW_Value], '') end + ''' where [id] = ''' + cast([_MEW_OBJ_UID] as varchar(36)) + ''';' as [_exec]

	from [Data];

	--REM: [id] einfügen
	insert into [##xxxResult]
	select distinct [_MEW_OBJ_UID] as [id] from [##xxxDMET];

	--REM: Spalten erstellen und Werte einfügen
	select @tSQL = isnull(@tSQL, '') + [_exec] from (select distinct [_exec] from [##xxxDMET]) as [tData];
	if not @tSQL is null begin
	print @tSQL;
		execute(@tSQL);
		set @tSQL = ''
	end;

	select @tSQL = isnull(@tSQL, '') + [_exec2] from (select distinct [_exec2] from [##xxxDMET]) as [tData];
	if not @tSQL is null begin
		execute(@tSQL)
	end;

	if object_id('tempdb..##xxxDMET') is not null drop table [##xxxDMET]

end;

--REM: Ausgabe der erstellten Daten
select * from [##xxxResult];

if object_id('tempdb..##xxxResult') is not null drop table [##xxxResult];