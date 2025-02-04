/* eslint-disable prettier/prettier */
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function POST(request: Request) {
  try {
    const { reportId, voterId } = await request.json();

    // First verify the report exists
    const { data: reportCheck, error: checkError } = await supabase
      .from("reports")
      .select("id")
      .eq("id", reportId);

    if (checkError || !reportCheck || reportCheck.length === 0) {
      return NextResponse.json({
        error: 'Report not found',
        details: { checkError, reportCheck }
      }, { status: 404 });
    }

    // Get current votes
    const { data: report, error: fetchError } = await supabase
      .from("reports")
      .select("over_votes")
      .eq("id", reportId)
      .single();

    if (fetchError) {
      return NextResponse.json({
        error: fetchError.message,
        details: fetchError
      }, { status: 500 });
    }

    // Initialize over_votes if null
    const currentVotes = report?.over_votes || [];

    if (!currentVotes.includes(voterId)) {
      const newVotes = currentVotes.concat(voterId);

      // First do the update
      const { error: updateError } = await supabase
        .from("reports")
        .update({ over_votes: newVotes })
        .eq("id", reportId);

      if (updateError) {
        return NextResponse.json({
          error: updateError.message,
          details: updateError
        }, { status: 500 });
      }

      // Verify the update
      const { data: verifyData, error: verifyError } = await supabase
        .from("reports")
        .select("id, over_votes")
        .eq("id", reportId)
        .single();

      if (verifyError || !verifyData || !verifyData.over_votes.includes(voterId)) {
        return NextResponse.json({
          error: 'Update verification failed',
          details: { verifyError, verifyData }
        }, { status: 500 });
      }

      // Then fetch all the data
      const { data: updatedReport, error: fetchError } = await supabase
        .from("reports")
        .select("*")
        .eq("id", reportId)
        .single();

      if (fetchError || !updatedReport) {
        return NextResponse.json({
          error: 'Failed to fetch updated report',
          details: fetchError
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data: updatedReport
      });
    }

    return NextResponse.json({
      success: true,
      alreadyVoted: true
    });
  } catch (error) {

    return NextResponse.json({
      error: 'Internal server error',
      details: error
    }, { status: 500 });
  }
}
